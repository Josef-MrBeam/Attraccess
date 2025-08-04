import { EnrollmentState, EnrollNTAG424State } from './enroll-ntag424.state';
import { InitialReaderState } from './initial.state';
import { AuthenticatedWebSocket, AttractapEventType } from '../websocket.types';
import { GatewayServices } from '../websocket.gateway';
import { User } from '@attraccess/database-entities';

// Mock crypto.subtle
const mockDigest = jest.fn();
jest.mock('crypto', () => ({
  subtle: {
    digest: (...args) => mockDigest(...args),
  },
}));

// Mock InitialReaderState
jest.mock('./initial.state', () => ({
  InitialReaderState: jest.fn().mockImplementation(() => ({
    onStateEnter: jest.fn().mockResolvedValue(undefined),
  })),
}));

// Mock setTimeout to avoid actual delays in tests
jest.useFakeTimers();

describe('EnrollNTAG424State', () => {
  let enrollState: EnrollNTAG424State;
  let mockSocket: AuthenticatedWebSocket & { enrollment?: EnrollmentState };
  let mockServices: GatewayServices;
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
  } as unknown as User;
  const mockCardUID = 'card-uid-123';
  const mockDefaultMasterKey = '00000000000000000000000000000000';
  const mockNewMasterKey = 'aaaabbbbccccddddeeeefffff0001111';

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    mockSocket = {
      enrollment: undefined,
      sendMessage: jest.fn(),
      transitionToState: jest.fn().mockResolvedValue(undefined),
      state: undefined,
    } as unknown as AuthenticatedWebSocket & { enrollment?: EnrollmentState };

    mockServices = {
      attractapService: {
        getNFCCardByUID: jest.fn(),
        createNFCCard: jest.fn().mockResolvedValue({ id: 'nfc-card-1' }),
        uint8ArrayToHexString: jest.fn().mockImplementation((uint8Array: Uint8Array) => {
          // Convert Uint8Array to hex string
          return Array.from(uint8Array)
            .map((b: number) => b.toString(16).padStart(2, '0'))
            .join('');
        }),
        generateNTAG424Key: jest
          .fn()
          .mockResolvedValue(
            new Uint8Array([
              0xaa, 0xaa, 0xbb, 0xbb, 0xcc, 0xcc, 0xdd, 0xdd, 0xee, 0xee, 0xff, 0xff, 0xf0, 0x00, 0x11, 0x11,
            ])
          ),
      },
      usersService: {
        findOne: jest.fn().mockResolvedValue(mockUser),
      },
    } as unknown as GatewayServices;

    // Setup subtle.digest mock to return a consistent value for testing
    mockDigest.mockImplementation(() => {
      return Promise.resolve(
        new Uint8Array(
          Array(32)
            .fill(0)
            .map((_, i) => (i % 16) + 0xa0)
        )
      );
    });

    enrollState = new EnrollNTAG424State(mockSocket, mockServices, mockUser);
  });

  describe('onStateEnter', () => {
    it('should initialize enrollment state and send the correct init message', async () => {
      await enrollState.onStateEnter();

      expect(mockSocket.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: AttractapEventType.NFC_ENABLE_CARD_CHECKING,
            payload: expect.objectContaining({
              type: 'enroll-nfc-card',
              user: expect.objectContaining({
                id: 1,
                username: undefined,
              }),
            }),
          }),
        })
      );
    });
  });

  describe('onStateExit', () => {
    it('should reset enrollment state', async () => {
      // First set up the enrollment state
      enrollState['enrollment'] = {
        nextExpectedEvent: AttractapEventType.NFC_TAP,
        data: {},
      };

      // Call onStateExit
      await enrollState.onStateExit();

      // Verify the enrollment state is reset
      expect(enrollState['enrollment']).toBeUndefined();
    });
  });

  describe('onEvent', () => {
    it('should handle NFC_TAP event when expected', async () => {
      // Setup
      await enrollState.onStateEnter();
      (mockSocket.sendMessage as jest.Mock).mockClear();
      (mockServices.attractapService.getNFCCardByUID as jest.Mock).mockResolvedValue(null);

      // Call method
      await enrollState.onEvent({
        type: AttractapEventType.NFC_TAP,
        payload: { cardUID: mockCardUID },
      });

      // Assert
      expect(mockSocket.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: AttractapEventType.NFC_DISABLE_CARD_CHECKING,
          }),
        })
      );

      expect(mockSocket.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: AttractapEventType.NFC_CHANGE_KEY,
            payload: {
              keyNumber: 0,
              oldKey: mockDefaultMasterKey,
              newKey: mockNewMasterKey,
              authKey: mockDefaultMasterKey,
            },
          }),
        })
      );
    });

    it('should ignore unexpected events', async () => {
      const initialCallCount = (mockSocket.sendMessage as jest.Mock).mock.calls.length;

      await enrollState.onEvent({
        type: AttractapEventType.DISPLAY_ERROR,
        payload: {},
      });

      expect((mockSocket.sendMessage as jest.Mock).mock.calls.length).toBe(initialCallCount);
    });
  });

  describe('onResponse', () => {
    it('should ignore responses with unexpected type', async () => {
      // Setup
      await enrollState.onStateEnter();
      (mockSocket.sendMessage as jest.Mock).mockClear();

      // Manually set the expected event
      enrollState['enrollment'] = {
        nextExpectedEvent: AttractapEventType.NFC_AUTHENTICATE,
        data: {},
      };

      // Send a different response type
      await enrollState.onResponse({
        type: AttractapEventType.NFC_CHANGE_KEY,
        payload: {},
      });

      // No new messages should be sent
      expect(mockSocket.sendMessage).not.toHaveBeenCalled();
    });

    it('should handle successful key change', async () => {
      // Setup
      await enrollState.onStateEnter();
      (mockSocket.sendMessage as jest.Mock).mockClear();

      // Manually set the enrollment state
      enrollState['enrollment'] = {
        nextExpectedEvent: AttractapEventType.NFC_CHANGE_KEY,
        cardUID: mockCardUID,
        data: {
          newKeyZeroMaster: mockNewMasterKey,
        },
      };

      // Call method and handle timers
      const responsePromise = enrollState.onResponse({
        type: AttractapEventType.NFC_CHANGE_KEY,
        payload: {
          successful: true,
        },
      });

      // Fast-forward through the 10 second delay
      await jest.runAllTimersAsync();
      await responsePromise;

      // Assert - should create NFC card and send success message
      expect(mockServices.attractapService.createNFCCard).toHaveBeenCalledWith(mockUser, {
        uid: mockCardUID,
        keys: {
          0: mockNewMasterKey,
        },
      });

      expect(mockSocket.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: AttractapEventType.DISPLAY_SUCCESS,
            payload: expect.objectContaining({
              message: 'Enrollment successful',
            }),
          }),
        })
      );

      expect(mockSocket.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: AttractapEventType.CLEAR_SUCCESS,
            payload: undefined,
          }),
        })
      );

      expect(mockSocket.transitionToState).toHaveBeenCalledWith(
        expect.objectContaining({
          onStateEnter: expect.any(Function),
        })
      );
    });

    it('should handle failed key change', async () => {
      // Setup
      await enrollState.onStateEnter();
      (mockSocket.sendMessage as jest.Mock).mockClear();

      // Manually set the enrollment state
      enrollState['enrollment'] = {
        nextExpectedEvent: AttractapEventType.NFC_CHANGE_KEY,
        data: {
          newKeyZeroMaster: mockNewMasterKey,
        },
      };

      // First key change failure - should retry
      await enrollState.onResponse({
        type: AttractapEventType.NFC_CHANGE_KEY,
        payload: {
          successful: false,
        },
      });

      // Assert retry message was sent and enrollment state still exists
      expect(enrollState['enrollment']).toBeDefined();
      expect(mockSocket.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            type: AttractapEventType.NFC_CHANGE_KEY,
            payload: {
              keyNumber: 0,
              authKey: mockNewMasterKey,
              oldKey: mockNewMasterKey,
              newKey: mockNewMasterKey,
            },
          }),
        })
      );

      // Clear message mock for second attempt
      (mockSocket.sendMessage as jest.Mock).mockClear();

      // Second key change failure - should give up
      await enrollState.onResponse({
        type: AttractapEventType.NFC_CHANGE_KEY,
        payload: {
          successful: false,
        },
      });

      // Assert enrollment cleared and transitioned to initial state
      expect(enrollState['enrollment']).toBeUndefined();
      expect(InitialReaderState).toHaveBeenCalledWith(mockSocket, mockServices);
      expect(mockSocket.transitionToState).toHaveBeenCalled();
      expect(mockSocket.sendMessage).not.toHaveBeenCalled();
    });
  });
});

/**
 * Tests that the socket is guided correctly through the enrollment process
 */
describe('EnrollNTAG424State - Full Flow', () => {
  let enrollState: EnrollNTAG424State;
  let mockSocket: AuthenticatedWebSocket & { enrollment?: EnrollmentState };
  let mockServices: GatewayServices;
  const mockUser = {
    id: 1,
    name: 'Test User',
    email: 'test@example.com',
    password: 'password',
  } as unknown as User;
  const mockCardUID = 'card-uid-123';
  const mockNewMasterKey = 'aaaabbbbccccddddeeeefffff0001111';

  beforeEach(async () => {
    jest.clearAllMocks();

    mockSocket = {
      enrollment: undefined,
      sendMessage: jest.fn(),
      transitionToState: jest.fn().mockResolvedValue(undefined),
      state: undefined,
    } as unknown as AuthenticatedWebSocket & { enrollment?: EnrollmentState };

    mockServices = {
      attractapService: {
        getNFCCardByUID: jest.fn(),
        createNFCCard: jest.fn().mockResolvedValue({ id: 'nfc-card-1' }),
        uint8ArrayToHexString: jest.fn().mockImplementation((uint8Array: Uint8Array) => {
          // Convert Uint8Array to hex string
          return Array.from(uint8Array)
            .map((b: number) => b.toString(16).padStart(2, '0'))
            .join('');
        }),
        generateNTAG424Key: jest
          .fn()
          .mockResolvedValue(
            new Uint8Array([
              0xaa, 0xaa, 0xbb, 0xbb, 0xcc, 0xcc, 0xdd, 0xdd, 0xee, 0xee, 0xff, 0xff, 0xf0, 0x00, 0x11, 0x11,
            ])
          ),
      },
      usersService: {
        findOne: jest.fn().mockResolvedValue(mockUser),
      },
    } as unknown as GatewayServices;

    mockDigest.mockImplementation(() => {
      return Promise.resolve(
        new Uint8Array(
          Array(32)
            .fill(0)
            .map((_, i) => (i % 16) + 0xa0)
        )
      );
    });

    enrollState = new EnrollNTAG424State(mockSocket, mockServices, mockUser);
  });

  afterEach(() => {
    // Clean up timers
    jest.clearAllTimers();
  });

  it('should complete successful enrollment flow', async () => {
    // Reset call history
    (mockSocket.sendMessage as jest.Mock).mockClear();
    (mockSocket.transitionToState as jest.Mock).mockClear();

    // Step 1: Initialize enrollment state
    await enrollState.onStateEnter();

    // Verify initial message
    expect(mockSocket.sendMessage).toHaveBeenCalledTimes(1);
    expect(mockSocket.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: AttractapEventType.NFC_ENABLE_CARD_CHECKING,
        }),
      })
    );

    // Step 2: User taps NFC card
    (mockServices.attractapService.getNFCCardByUID as jest.Mock).mockResolvedValue(null);

    await enrollState.onEvent({
      type: AttractapEventType.NFC_TAP,
      payload: { cardUID: mockCardUID },
    });

    // Verify DISABLE_CARD_CHECKING and CHANGE_KEYS messages
    expect(mockSocket.sendMessage).toHaveBeenCalledTimes(3);
    expect(mockSocket.sendMessage).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({
          type: AttractapEventType.NFC_DISABLE_CARD_CHECKING,
        }),
      })
    );
    expect(mockSocket.sendMessage).toHaveBeenNthCalledWith(
      3,
      expect.objectContaining({
        data: expect.objectContaining({
          type: AttractapEventType.NFC_CHANGE_KEY,
        }),
      })
    );

    // Step 3: Keys changed successfully
    const keyChangePromise = enrollState.onResponse({
      type: AttractapEventType.NFC_CHANGE_KEY,
      payload: {
        successful: true,
      },
    });

    // Fast-forward through the 10 second delay
    await jest.runAllTimersAsync();
    await keyChangePromise;

    // Verify success message and card creation
    expect(mockServices.attractapService.createNFCCard).toHaveBeenCalled();
    expect(mockSocket.sendMessage).toHaveBeenCalledTimes(5);
    expect(mockSocket.sendMessage).toHaveBeenNthCalledWith(
      4,
      expect.objectContaining({
        data: expect.objectContaining({
          type: AttractapEventType.DISPLAY_SUCCESS,
          payload: expect.objectContaining({
            message: 'Enrollment successful',
          }),
        }),
      })
    );
    expect(mockSocket.sendMessage).toHaveBeenNthCalledWith(
      5,
      expect.objectContaining({
        data: expect.objectContaining({
          type: AttractapEventType.CLEAR_SUCCESS,
          payload: undefined,
        }),
      })
    );
    expect(mockSocket.transitionToState).toHaveBeenCalledTimes(1);
  });

  it('should handle key change failure', async () => {
    // Reset call history
    (mockSocket.sendMessage as jest.Mock).mockClear();
    (mockSocket.transitionToState as jest.Mock).mockClear();

    // Initialize and tap card
    await enrollState.onStateEnter();
    (mockServices.attractapService.getNFCCardByUID as jest.Mock).mockResolvedValue(null);

    await enrollState.onEvent({
      type: AttractapEventType.NFC_TAP,
      payload: { cardUID: mockCardUID },
    });

    // Clear message history before testing key change failure
    (mockSocket.sendMessage as jest.Mock).mockClear();

    // Simulate first key change failure - should retry
    await enrollState.onResponse({
      type: AttractapEventType.NFC_CHANGE_KEY,
      payload: {
        successful: false,
      },
    });

    // Verify retry message was sent
    expect(mockSocket.sendMessage).toHaveBeenCalledTimes(1);
    expect(mockSocket.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: AttractapEventType.NFC_CHANGE_KEY,
          payload: {
            keyNumber: 0,
            authKey: mockNewMasterKey,
            oldKey: mockNewMasterKey,
            newKey: mockNewMasterKey,
          },
        }),
      })
    );

    // Clear message history for second attempt
    (mockSocket.sendMessage as jest.Mock).mockClear();

    // Simulate second key change failure - should give up
    await enrollState.onResponse({
      type: AttractapEventType.NFC_CHANGE_KEY,
      payload: {
        successful: false,
      },
    });

    // Verify no messages sent on second failure and transition to initial state
    expect(mockSocket.sendMessage).not.toHaveBeenCalled();
    expect(mockSocket.transitionToState).toHaveBeenCalledTimes(1);
    expect(InitialReaderState).toHaveBeenCalledWith(mockSocket, mockServices);
  });

  it('should handle existing card tap', async () => {
    // Setup mock for existing card
    const existingCard = {
      id: 'existing-card-1',
      uid: mockCardUID,
      keys: { 0: 'existingMasterKey' },
    };
    (mockServices.attractapService.getNFCCardByUID as jest.Mock).mockResolvedValue(existingCard);

    // Initialize and tap card
    await enrollState.onStateEnter();
    (mockSocket.sendMessage as jest.Mock).mockClear();

    await enrollState.onEvent({
      type: AttractapEventType.NFC_TAP,
      payload: { cardUID: mockCardUID },
    });

    // Verify it attempts to change keys using the existing master key
    expect(mockSocket.sendMessage).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          type: AttractapEventType.NFC_CHANGE_KEY,
          payload: {
            keyNumber: 0,
            authKey: 'existingMasterKey',
            oldKey: 'existingMasterKey',
            newKey: mockNewMasterKey,
          },
        }),
      })
    );
  });

  it('should ignore unexpected events', async () => {
    // Initialize enrollment
    await enrollState.onStateEnter();
    (mockSocket.sendMessage as jest.Mock).mockClear();

    // Send unexpected event
    await enrollState.onEvent({
      type: AttractapEventType.DISPLAY_ERROR,
      payload: {},
    });

    // Verify no messages were sent
    expect(mockSocket.sendMessage).not.toHaveBeenCalled();
  });
});

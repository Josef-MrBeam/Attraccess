import { SemanticVersion, SemanticVersionString, SemanticVersionArray, SemanticVersionObject } from './semver';

describe('SemanticVersion', () => {
  const v1_0_0_obj: SemanticVersionObject = { major: 1, minor: 0, patch: 0 };
  const v1_0_0_str: SemanticVersionString = '1.0.0';
  const v1_0_0_arr: SemanticVersionArray = [1, 0, 0];
  const v1_0_0 = new SemanticVersion(v1_0_0_obj);

  const v1_1_0_obj: SemanticVersionObject = { major: 1, minor: 1, patch: 0 };
  const v1_1_0_str: SemanticVersionString = '1.1.0';
  const v1_1_0_arr: SemanticVersionArray = [1, 1, 0];
  const v1_1_0 = new SemanticVersion(v1_1_0_obj);

  const v2_0_0_obj: SemanticVersionObject = { major: 2, minor: 0, patch: 0 };
  const v2_0_0_str: SemanticVersionString = '2.0.0';
  const v2_0_0_arr: SemanticVersionArray = [2, 0, 0];
  const v2_0_0 = new SemanticVersion(v2_0_0_obj);

  describe('constructor', () => {
    it('should create an instance from a valid object', () => {
      const version = new SemanticVersion(v1_0_0_obj);
      expect(version.major).toBe(1);
      expect(version.minor).toBe(0);
      expect(version.patch).toBe(0);
    });

    it('should throw an error for invalid object types', () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => new SemanticVersion({ major: 1, minor: 0, patch: 'a' } as any)).toThrow('Invalid version object');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => new SemanticVersion({ major: 1, minor: 'b', patch: 0 } as any)).toThrow('Invalid version object');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      expect(() => new SemanticVersion({ major: 'c', minor: 0, patch: 0 } as any)).toThrow('Invalid version object');
    });
  });

  describe('fromString', () => {
    it('should create an instance from a valid string', () => {
      const version = SemanticVersion.fromString(v1_0_0_str);
      expect(version.major).toBe(1);
      expect(version.minor).toBe(0);
      expect(version.patch).toBe(0);
    });

    it('should throw an error for invalid strings', () => {
      expect(() => SemanticVersion.fromString('1.0')).toThrow('Invalid version string');
      expect(() => SemanticVersion.fromString('1.0.a')).toThrow('Invalid version string');
      expect(() => SemanticVersion.fromString('a.b.c')).toThrow('Invalid version string');
    });
  });

  describe('fromArray', () => {
    it('should create an instance from a valid array', () => {
      const version = SemanticVersion.fromArray(v1_0_0_arr);
      expect(version.major).toBe(1);
      expect(version.minor).toBe(0);
      expect(version.patch).toBe(0);
    });

    // Note: Type safety prevents invalid array elements at compile time usually
    // If needed, add runtime checks in fromArray or constructor
  });

  describe('fromSemanticVersionLike', () => {
    it('should create an instance from SemanticVersionObject', () => {
      const version = SemanticVersion.fromSemanticVersionLike(v1_0_0_obj);
      expect(version).toEqual(v1_0_0);
    });

    it('should create an instance from SemanticVersionString', () => {
      const version = SemanticVersion.fromSemanticVersionLike(v1_0_0_str);
      expect(version).toEqual(v1_0_0);
    });

    it('should create an instance from SemanticVersionArray', () => {
      const version = SemanticVersion.fromSemanticVersionLike(v1_0_0_arr);
      expect(version).toEqual(v1_0_0);
    });

    it('should return the same instance if SemanticVersion is passed', () => {
      const version = SemanticVersion.fromSemanticVersionLike(v1_0_0);
      expect(version).toBeInstanceOf(SemanticVersion); // Check if it's the expected type
      expect(version.major).toBe(1);
      expect(version.minor).toBe(0);
      expect(version.patch).toBe(0);
    });
  });

  describe('toString', () => {
    it('should return the correct string representation', () => {
      expect(v1_0_0.toString()).toBe(v1_0_0_str);
      expect(v1_1_0.toString()).toBe(v1_1_0_str);
      expect(v2_0_0.toString()).toBe(v2_0_0_str);
    });
  });

  describe('toArray', () => {
    it('should return the correct array representation', () => {
      expect(v1_0_0.toArray()).toEqual(v1_0_0_arr);
      expect(v1_1_0.toArray()).toEqual(v1_1_0_arr);
      expect(v2_0_0.toArray()).toEqual(v2_0_0_arr);
    });
  });

  describe('equals', () => {
    it('should return true for equal versions', () => {
      expect(v1_0_0.equals(v1_0_0_obj)).toBe(true);
      expect(v1_0_0.equals(v1_0_0_str)).toBe(true);
      expect(v1_0_0.equals(v1_0_0_arr)).toBe(true);
      expect(v1_0_0.equals(new SemanticVersion({ major: 1, minor: 0, patch: 0 }))).toBe(true);
    });

    it('should return false for unequal versions', () => {
      expect(v1_0_0.equals(v1_1_0)).toBe(false);
      expect(v1_0_0.equals(v2_0_0)).toBe(false);
      expect(v1_1_0.equals(v1_0_0)).toBe(false);
    });
  });

  describe('isGreaterThan', () => {
    it('should return true when the version is greater', () => {
      expect(v1_1_0.isGreaterThan(v1_0_0)).toBe(true);
      expect(v2_0_0.isGreaterThan(v1_1_0)).toBe(true);
      expect(v2_0_0.isGreaterThan(v1_0_0_str)).toBe(true);
      expect(new SemanticVersion({ major: 1, minor: 0, patch: 1 }).isGreaterThan(v1_0_0)).toBe(true);
    });

    it('should return false when the version is not greater', () => {
      expect(v1_0_0.isGreaterThan(v1_0_0)).toBe(false);
      expect(v1_0_0.isGreaterThan(v1_1_0)).toBe(false);
      expect(v1_0_0.isGreaterThan(v2_0_0_arr)).toBe(false);
    });
  });

  describe('isLessThan', () => {
    it('should return true when the version is less', () => {
      expect(v1_0_0.isLessThan(v1_1_0)).toBe(true);
      expect(v1_1_0.isLessThan(v2_0_0)).toBe(true);
      expect(v1_0_0.isLessThan(v2_0_0_str)).toBe(true);
      expect(v1_0_0.isLessThan(new SemanticVersion({ major: 1, minor: 0, patch: 1 }))).toBe(true);
    });

    it('should return false when the version is not less', () => {
      expect(v1_0_0.isLessThan(v1_0_0)).toBe(false);
      expect(v1_1_0.isLessThan(v1_0_0)).toBe(false);
      expect(v2_0_0.isLessThan(v1_1_0_arr)).toBe(false);
    });
  });

  describe('isGreaterThanOrEqualTo', () => {
    it('should return true when the version is greater or equal', () => {
      expect(v1_0_0.isGreaterThanOrEqualTo(v1_0_0)).toBe(true);
      expect(v1_1_0.isGreaterThanOrEqualTo(v1_0_0)).toBe(true);
      expect(v2_0_0.isGreaterThanOrEqualTo(v1_1_0)).toBe(true);
      expect(v2_0_0.isGreaterThanOrEqualTo(v1_0_0_str)).toBe(true);
      expect(new SemanticVersion({ major: 1, minor: 0, patch: 1 }).isGreaterThanOrEqualTo(v1_0_0)).toBe(true);
    });

    it('should return false when the version is less', () => {
      expect(v1_0_0.isGreaterThanOrEqualTo(v1_1_0)).toBe(false);
      expect(v1_0_0.isGreaterThanOrEqualTo(v2_0_0_arr)).toBe(false);
    });
  });

  describe('isLessThanOrEqualTo', () => {
    it('should return true when the version is less or equal', () => {
      expect(v1_0_0.isLessThanOrEqualTo(v1_0_0)).toBe(true);
      expect(v1_0_0.isLessThanOrEqualTo(v1_1_0)).toBe(true);
      expect(v1_1_0.isLessThanOrEqualTo(v2_0_0)).toBe(true);
      expect(v1_0_0.isLessThanOrEqualTo(v2_0_0_str)).toBe(true);
      expect(v1_0_0.isLessThanOrEqualTo(new SemanticVersion({ major: 1, minor: 0, patch: 1 }))).toBe(true);
    });

    it('should return false when the version is greater', () => {
      expect(v1_1_0.isLessThanOrEqualTo(v1_0_0)).toBe(false);
      expect(v2_0_0.isLessThanOrEqualTo(v1_1_0_arr)).toBe(false);
    });
  });
});

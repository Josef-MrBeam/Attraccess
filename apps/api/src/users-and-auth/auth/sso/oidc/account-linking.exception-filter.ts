import { ExceptionFilter, Catch, ArgumentsHost, Logger } from '@nestjs/common';
import { Request, Response } from 'express';
import { AccountLinkingRequiredException } from './exceptions/account-linking-required.exception';

@Catch(AccountLinkingRequiredException)
export class AccountLinkingExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AccountLinkingExceptionFilter.name);

  catch(exception: AccountLinkingRequiredException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest() as Request;

    this.logger.log(`Account linking required for email: ${exception.email}`);

    // Get the original redirectTo from query params
    const redirectTo = request.query.redirectTo as string;
    this.logger.debug('Original query: ', request.query);

    if (redirectTo) {
      // Redirect to frontend with account linking data
      const frontendUrl = new URL(redirectTo);
      // Clear any existing parameters and set account linking parameters
      frontendUrl.search = '';
      frontendUrl.searchParams.set('ssoProviderId', exception.providerId.toString());
      frontendUrl.searchParams.set('ssoProviderType', exception.providerType);
      frontendUrl.searchParams.set('accountLinking', 'required');
      frontendUrl.searchParams.set('email', exception.email);
      frontendUrl.searchParams.set('externalId', exception.externalId);

      this.logger.log(`Redirecting to frontend for account linking: ${frontendUrl.toString()}`);
      return response.redirect(frontendUrl.toString());
    }

    // Fallback: return JSON if no redirect URL
    response.status(400).json({
      error: 'AccountLinkingRequired',
      message: 'Account linking required',
      email: exception.email,
      externalId: exception.externalId,
    });
  }
}

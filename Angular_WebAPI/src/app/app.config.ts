import {
  ApplicationConfig, EnvironmentProviders,
  provideExperimentalZonelessChangeDetection
} from "@angular/core";
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import {
  createInterceptorCondition,
  INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
  IncludeBearerTokenCondition, includeBearerTokenInterceptor,
  provideKeycloak
} from "keycloak-angular";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { ConfigService } from "../core/config.service";

function provideConfiguredKeycloak(): EnvironmentProviders {
  function createAuthTokenCondition(configService: ConfigService) {
    const { protocol, hostname, port } = new URL(configService.config.backendBaseUrl);
    const hostPort = port ? `${hostname}:${port}` : hostname;
    const urlPattern = new RegExp(`^${protocol}//${hostPort}(\\/.*)?$`, 'i');
    return createInterceptorCondition<IncludeBearerTokenCondition>({
      urlPattern: urlPattern
    });
  }

  return provideKeycloak({
    config: {
      url: 'https://auth.htl-leonding.ac.at', // URL of the Keycloak server
      realm: 'htlleonding', // Realm to be used in Keycloak
      clientId: 'htlleonding-service' // Client ID for the application in Keycloak,
    },
    initOptions: {
      onLoad: 'check-sso', // Action to take on load
      //enableLogging: true, // Enables logging
      // IMPORTANT: implicit flow is no longer recommended, but using standard flow leads to a 401 at the keycloak server
      // when retrieving the token with the access code - we leave it like this for the moment until a solution is found
      flow: 'implicit'
    },
    providers: [
      {
        provide: INCLUDE_BEARER_TOKEN_INTERCEPTOR_CONFIG,
        useFactory: async (configService: ConfigService)=> {
          await configService.loadConfig();
          return createAuthTokenCondition(configService);
      }, // Specify conditions for adding the Bearer token
        deps: [ConfigService]
      }
    ]
  });
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideExperimentalZonelessChangeDetection(),
    provideHttpClient(withInterceptors([includeBearerTokenInterceptor])),
    provideRouter(routes),
    provideAnimationsAsync(),
    // also inits app config
    provideConfiguredKeycloak()
  ]
};

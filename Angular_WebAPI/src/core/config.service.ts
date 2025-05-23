import { inject, Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";

@Injectable({
  providedIn: "root"
})
export class ConfigService {
  private readonly httpClient: HttpClient = inject(HttpClient);
  private appConfig: Config | null = null;

  public get config(): Config {
    if (this.appConfig === null) {
      throw new Error("Config not loaded");
    }
    return this.appConfig;
  }

  public async loadConfig(): Promise<void> {
    const response: IConfigResponse = await firstValueFrom(this.httpClient.get<IConfigResponse>("/config/app-config.json"));
    this.appConfig = new Config(response.backendBaseUrl);
  }
}

interface IConfigResponse {
  backendBaseUrl: string;
}

export class Config {
  constructor(public readonly backendBaseUrl: string) {
  }
}

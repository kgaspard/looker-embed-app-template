import { Looker40SDK, DefaultSettings } from "@looker/sdk";
import { AuthToken, AuthSession, BrowserTransport } from "@looker/sdk-rtl";

class PblSession extends AuthSession {

  fetchToken() {
    return fetch("");
  }

  activeToken = new AuthToken()
  constructor(settings, transport) {
    super(settings, transport || new BrowserTransport(settings));
  }
  
  isAuthenticated() {
    const token = this.activeToken;
    if (!(token && token.access_token)) return false;
    return token.isActive();
  }

  async getToken() {
    if (!this.isAuthenticated()) {
      const token = await this.fetchToken();
      const res = await token.json()
      this.activeToken.setToken(res.user_token);
    }
    return this.activeToken;
  }

  async authenticate(props) {
    const token = await this.getToken();
    if (token && token.access_token) {
      props.mode = "cors";
      delete props.credentials;
      props.headers = {
        ...props.headers,
        Authorization: `Bearer ${this.activeToken.access_token}`
      };
    }
    return props;
  }
}

class PblSessionEmbed extends PblSession {
  fetchToken() {
    return fetch(
      "/api/sdkToken"
    );
  }
}

const session = new PblSessionEmbed({
  ...DefaultSettings,
  base_url: appSession.apiHost
});

export const sdk = new Looker40SDK(session);
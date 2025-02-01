import pdos, { Core } from "../Core";
import { ConfigValidationError, ModuleNotFoundError } from "../Errors";

describe('Configuration setup', () => {

  it('It initializes the env to an accepted option', () => {
    new Core({
      env: "production",
      context: {
        gatewayURL: "test",
      }
    });

    expect(pdos().initConfig.env).toBe('production');
  });

  it('It fails initializing the env to an unaccepted option', () => {
    expect(() => new Core({
      env: "qa",
      context: {
        gatewayURL: "",
      }
    } as any)).toThrow(ConfigValidationError);
  });

  it('It sets the gateway url', () => {
    const gatewayURL = "test";
    new Core({
      env: "production",
      context: {
        gatewayURL,
      }
    });

    expect(pdos().gatewayURL).toBe(gatewayURL);
  });

  it('It sets an init test credential id', () => {
    new Core({
      env: 'development',
      context: {
        gatewayURL: "test",
      },
      test: {
        initCredentialId: "test"
      }
    });

    expect(pdos().test.initCredentialId).toBe("test");
  });

  it('It throws an error if test object is passed when env !== development', () => {
    new Core({
      env: "production",
      context: {
        gatewayURL: "test",
      },
      test: {
        initCredentialId: "test"
      }
    });

    expect(pdos().test.initCredentialId).toBe("test");
  });

  it('Its able to set as a compute node', () => {
    new Core({
      env: "production",
      context: {
        gatewayURL: "test",
        isComputeNode: true
      },
    });

    expect(pdos().isComputeNode).toBe(true);
  });

  it('Its able to pass in a module that gets started', async () => {
    new Core({
      env: "production",
      context: {
        gatewayURL: "test",
      },
      modules: {
        auth: {}
      }
    });

    pdos().start();
    await pdos().started

    expect(pdos().modules.auth).toBeDefined();
  });

  it('It throws an error if it is passed in a module that doesnt exist', async () => {

    expect(async () => {
      new Core({
        env: "production",
        context: {
          gatewayURL: "test",
        },
        modules: {
          shouldNotBeFound: {}
        }
      });
        await pdos().start();
    }).rejects.toThrow(ModuleNotFoundError)
  });

});
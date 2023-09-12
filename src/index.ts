import type { Environment, EnvironmentOptions as EO } from "vitest";

import { ContainerConfiguration, setup } from "./setup";

export type ContainerConfigurations = ContainerConfiguration[];

export interface EnvironmentOptions extends EO {
  testcontainers?: {
    containers?: ContainerConfigurations;
  };
}

declare global {
  // eslint-disable-next-line no-var
  var testcontainers: { containers: Awaited<ReturnType<typeof setup>> };
}

export default {
  name: "testcontainers",
  transformMode: "ssr",
  async setup(_, options: EnvironmentOptions) {
    if (!options.testcontainers?.containers) {
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      return { teardown: () => {} };
    }

    const containers = await setup(options.testcontainers.containers);

    Object.defineProperty(globalThis, "testcontainers", {
      value: {
        containers: containers.map((container) => {
          const { container: _, ...rest } = container;
          return rest;
        }),
      },
      configurable: true,
    });

    return {
      async teardown(global) {
        await Promise.all(containers.map((container) => container.container.stop()));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-dynamic-delete
        delete global.testcontainers;
      },
    };
  },
} as Environment;

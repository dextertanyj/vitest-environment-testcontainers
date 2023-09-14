# vitest-environment-testcontainers

A [Vitest](https://vitest.dev/) environment with integrated support for [Testcontainers](https://testcontainers.com/).

## Features

- ⚙️ Setup and teardown containers automatically during Vitest runs.
- ✏️ Type-safe interface.
- 📖 Access container metadata during test runtime.

## Requirements

- [Docker](https://www.docker.com/)
- [Vitest](https://vitest.dev/)

## Quickstart

**1. Install `vitest-environment-testcontainers`.**

```shell
npm i -D vitest-environment-testcontainers
```

**2. Configure Vitest in `vitest.config.ts` to use the environment.**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    // ...
    environment: "testcontainers",
  },
});
```

_See [here](https://vitest.dev/guide/#configuring-vitest) for more information on how to configure Vitest._

**3. Specify the containers to launch.**

```ts
import { type EnvironmentOptions } from "vitest-environment-testcontainers";

const environmentOptions: EnvironmentOptions = {
  testcontainers: {
    containers: [
      {
        name: 'database'
        image: 'postgres:latest'
        ports: [5432],
        environment: {
          POSTGRES_USER: 'root',
          POSTGRES_PASSWORD: 'root',
          POSTGRES_DB: 'test'
        }
        wait: {
          type: 'PORT'
        }
      }
    ],
  },
};

export default defineConfig({
  test: {
    // ...
    environment: "testcontainers",
    environmentOptions,
  },
});
```

**4. Get information about the containers inside your tests.**

Retrieve information about started containers through the global object.

```ts
describe("Test", () => {
  // Type: Array<{ name: string; host: string; ports: Array<{ container: number; host: number }>;
  const containers = globalThis.testcontainers.containers;

  // ...
});
```

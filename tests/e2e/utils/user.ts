export function makeE2EUser() {
  const suffix = `${Date.now()}-${Math.floor(Math.random() * 10_000)}`;
  return {
    name: `E2E User ${suffix}`,
    email: `lifesync.e2e.${suffix}@example.com`,
    password: `LifeSync!${suffix}`,
  };
}

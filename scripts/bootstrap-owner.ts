import { bootstrapSuperOwner } from "../src/lib/auth/owner-bootstrap";

bootstrapSuperOwner()
  .then((result) => {
    console.log(result.created ? "SUPER_OWNER created." : `No change: ${result.reason}`);
    if (result.created) console.log("Disable BOOTSTRAP_OWNER_ENABLED immediately.");
  })
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
  });

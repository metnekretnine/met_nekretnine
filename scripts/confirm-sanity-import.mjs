import { config } from "dotenv";
import { exec } from "child_process";
import * as readline from "readline";

// Učitaj .env.local
config({ path: ".env.local" });

// Mapiraj svoju varijablu na ono što Sanity CLI traži
if (!process.env.SANITY_API_WRITE_TOKEN) {
  console.error(
    "❌ SANITY_API_WRITE_TOKEN nije postavljen u .env.local — prekidam da ne pišem u krivi projekt."
  );
  process.exit(1);
}
process.env.SANITY_AUTH_TOKEN = process.env.SANITY_API_WRITE_TOKEN;

console.log("Fetching Sanity project info...");

exec("sanity debug", (error, stdout, stderr) => {
  if (error) {
    console.error(`Error fetching Sanity project info: ${error.message}`);
    if (stderr) {
      console.error(stderr);
    }
    process.exit(1);
  }

  console.log("\n--- Sanity Project Info ---");
  console.log(stdout);
  console.log("---------------------------\n");

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  rl.question(
    `Are you sure you want to import data to the project detailed above? (y/n) `,
    (answer) => {
      rl.close();
      if (answer.toLowerCase() === "y") {
        console.log("Confirmed. Starting Sanity import...");
        const importCommand =
          "sanity dataset import src/sanity/dump/sanityDump.ndjson production --replace";
        const child = exec(importCommand);

        child.stdout?.pipe(process.stdout);
        child.stderr?.pipe(process.stderr);

        child.on("close", (code) => {
          console.log(`\nImport process finished with code ${code}`);
          process.exit(code ?? 0);
        });
      } else {
        console.log("Import cancelled.");
        process.exit(0);
      }
    }
  );
});
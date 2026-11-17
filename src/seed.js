import { createWriteStream, statSync } from "node:fs"
import { once } from "node:events"
import { faker } from "@faker-js/faker"

export const LOG_FILE = "access.log"
export const LOG_INTERVAL = 1 * 1000
const maxRecords = Number(process.argv[2] || 1000)
const writeStream = createWriteStream(LOG_FILE, { flags: "a" })

if (
  !Number.isInteger(maxRecords)
  || Number.isNaN(maxRecords)
  || maxRecords <= 0
) {
  throw new Error("Invalid maxRecords value")
}

function generateUser() {
  return {
   ip: faker.internet.ip(),
   username: faker.internet.userName(),
   first_name: faker.name.firstName(),
   last_name: faker.name.lastName(),
   email: faker.internet.email(),
   location: faker.address.city(),
   job_area: faker.name.jobArea(),
   company: faker.company.name(),
   job_title: faker.name.jobTitle(),
   id: faker.string.uuid()
  
  }
}

function generateLogEntry(user) {
  return {
    timestamp: faker.date.recent().toISOString(),
    url: faker.internet.url(),
    status: faker.helpers.arrayElement([200, 201, 400, 401, 403, 404, 500]),
    method: faker.helpers.arrayElement(["GET", "POST", "PUT", "DELETE"])
  }
}

function writeRecord(line) {
  return new Promise((resolve) => {
    if (!writeStream.write(`${line}\n`)) {
      writeStream.once("drain", resolve)
    } else {
      resolve();
    }
  })
}
 
console.log(`Gerando logs de acesso falsos em ${LOG_FILE}... (cntrl + C para parar)`)
console.log(`Limite de registros: ${maxRecords.toLocaleString()}`)

const users = Array.from({ length: maxRecords }, generateUser)

let count = 0;
while (count < maxRecords) {
  const user = users[count]
  const logEntry = generateLogEntry(user)
  await writeRecord(JSON.stringify({ ...logEntry, ...user }) + "\n")
  count++

  if (count % 1000 === 0) {
    console.log(`${count.toLocaleString()} registros gerados...`)
  }
}
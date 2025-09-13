import { parseCSV } from "../src/basic-parser";
import * as path from "path";
import { z } from "zod";

const PEOPLE_CSV_PATH = path.join(__dirname, "../data/people.csv");
const LABEL_CSV_PATH = path.join(__dirname, "../data/label.csv");
const COMMA_CSV_PATH = path.join(__dirname, "../data/comma_incl.csv");
const MULTIPLE_CSV_PATH = path.join(__dirname, "../data/sample_data.csv");
const MISSING_CSV_PATH = path.join(__dirname, "../data/missing_data.csv");
const SINGLE_CSV_PATH = path.join(__dirname, "../data/single_data.csv");
const WRONG_CSV_PATH = path.join(__dirname, "../data/wrong_data.csv");

// Part A Tests (no schema provided, returned array of strings)

test("parseCSV yields arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH, undefined)
  
  if (results instanceof z.ZodError) {
    fail(`Unexpected parse error: ${results.message}`);
  }

  expect(results).toHaveLength(5);
  expect(results[0]).toEqual(["name", "age"]);
  expect(results[1]).toEqual(["Alice", "23"]);
  expect(results[2]).toEqual(["Bob", "thirty"]); // why does this work? :(
  expect(results[3]).toEqual(["Charlie", "25"]);
  expect(results[4]).toEqual(["Nim", "22"]);
});

test("parseCSV yields only arrays", async () => {
  const results = await parseCSV(PEOPLE_CSV_PATH, undefined)

  if (results instanceof z.ZodError) {
    fail(`Unexpected parse error: ${results.message}`);
  }

  for(const row of results) {
    expect(Array.isArray(row)).toBe(true);
  }
});

test("parseCSV correctly parses data with 1 field", async () => {
  const results = await parseCSV(SINGLE_CSV_PATH, undefined)

  if (results instanceof z.ZodError) {
    fail(`Unexpected parse error: ${results.message}`);
  }
  
  expect(results).toHaveLength(4);
  expect(results[0]).toEqual(["tommy"]);
  expect(results[1]).toEqual(["michael"]);
  expect(results[2]).toEqual(["timmy"]); 
  expect(results[3]).toEqual(["isaiah"]); 
});

test("parseCSV correctly parses data with 2+ fields and whitespace auto-trimmed", async () => {
  const results = await parseCSV(MULTIPLE_CSV_PATH, undefined)

  if (results instanceof z.ZodError) {
    fail(`Unexpected parse error: ${results.message}`);
  }

  expect(results).toHaveLength(4);
  expect(results[0]).toEqual(["Nim", "22", "football"]);
  expect(results[1]).toEqual(["Michael", "19", "basketball"]);
  expect(results[2]).toEqual(["Shant", "19", "rowing"]); 
  expect(results[3]).toEqual(["Timmy", "29", "hockey"]); 
});

test("parseCSV correctly parses missing data", async () => {
  const results = await parseCSV(MISSING_CSV_PATH, undefined)

  if (results instanceof z.ZodError) {
    fail(`Unexpected parse error: ${results.message}`);
  }

  expect(results).toHaveLength(4);
  expect(results[0]).toEqual(["Alice", "she/her", "23"]);
  expect(results[1]).toEqual(["Bob", "he/him", ""]);
  expect(results[2]).toEqual(["", "they/them", "25"]); 
  expect(results[3]).toEqual(["Nim", "", "22"]); 
});

test("parseCSV accepts invalid data", async () => {
  const results = await parseCSV(WRONG_CSV_PATH, undefined)

  if (results instanceof z.ZodError) {
    fail(`Unexpected parse error: ${results.message}`);
  }

  expect(results).toHaveLength(5);
  expect(results[0]).toEqual(["completely", "messed", "up", "fields"]);
  expect(results[1]).toEqual(["hello", ""]);
  expect(results[2]).toEqual(["data", "is", "completely", "missing"]); 
  expect(results[3]).toEqual([""]);
  expect(results[4]).toEqual(["where"]);
});

test("parseCSV fails to exclude column labels when present", async () => {
  const results = await parseCSV(LABEL_CSV_PATH, undefined)

  if (results instanceof z.ZodError) {
    fail(`Unexpected parse error: ${results.message}`);
  }

  expect(results).toHaveLength(3);
  expect(results[0]).toEqual(["bob", "snow"]);
  expect(results[1]).toEqual(["john", "stark"]);
  expect(results[2]).toEqual(["alice", "sand"]); 
});

test("parseCSV fails to correctly parse commas in data and includes double quotes", async () => {
  const results = await parseCSV(COMMA_CSV_PATH, undefined)

  if (results instanceof z.ZodError) {
    fail(`Unexpected parse error: ${results.message}`);
  }

  expect(results).toHaveLength(3);
  expect(results[0]).toEqual(["greeting", "hello, friend"]);
  expect(results[1]).toEqual(["farewell", "goodbye, neighbor"]);
  expect(results[2]).toEqual(["phrase", "arrival, departure"]); 
});

// Part C Tests (schema provided, returned array of schema objects or ZodError)

test("parseCSV returns array of schema objects when all row data matches schema", async () => {
  const nameAgeSportSchema = z.tuple([(z.string()), (z.coerce.number()), (z.string())]);
  const results = await parseCSV(MULTIPLE_CSV_PATH, nameAgeSportSchema)

  if (results instanceof z.ZodError) {
    fail(`Unexpected parse error: ${results.message}`);
  }

  expect(results).toHaveLength(4);
  expect(results[0]).toEqual(["Nim", 22, "football"]);
  expect(results[1]).toEqual(["Michael", 19, "basketball"]);
  expect(results[2]).toEqual(["Shant", 19, "rowing"]); 
  expect(results[3]).toEqual(["Timmy", 29, "hockey"]); 
});

test("parseCSV returns array of schema objects when all row data matches schema, even with missing data", async () => {
  const namePronounsAgeSchema = z.tuple([(z.string()), (z.string()), (z.coerce.number())]);
  const results = await parseCSV(MISSING_CSV_PATH, namePronounsAgeSchema)

  if (results instanceof z.ZodError) {
    fail(`Unexpected parse error: ${results.message}`);
  }

  expect(results).toHaveLength(4);
  expect(results[0]).toEqual(["Alice", "she/her", 23]);
  expect(results[1]).toEqual(["Bob", "he/him", 0]); // missing data (empty string) coerced to 0
  expect(results[2]).toEqual(["", "they/them", 25]);
  expect(results[3]).toEqual(["Nim", "", 22]);
});

test("parseCSV coerces all values to specified data type if possible (boolean case)", async () => {
  const boolSchema = z.tuple([(z.coerce.boolean())]);
  const results = await parseCSV(SINGLE_CSV_PATH, boolSchema)

  if (results instanceof z.ZodError) {
    fail(`Unexpected parse error: ${results.message}`);
  }
  
  expect(results).toHaveLength(4);
  expect(results[0]).toEqual([true]);
  expect(results[1]).toEqual([true]);
  expect(results[2]).toEqual([true]); 
  expect(results[3]).toEqual([true]); 
});

test("parseCSV correctly returns a Zod error when row data does not match provided schema", async () => {
  const nameAgeSchema = z.tuple([(z.string()), (z.coerce.number())]);
  const results = await parseCSV(PEOPLE_CSV_PATH, nameAgeSchema)
  
  // Expected to error because of "thirty" in row 2
  expect(results).toBeInstanceOf(z.ZodError);
});

test("parseCSV fails when non string schema is used without coerce", async () => {
  const nameAgeSportSchema = z.tuple([(z.string()), (z.number()), (z.string())]);
  const results = await parseCSV(MULTIPLE_CSV_PATH, nameAgeSportSchema)

  expect(results).toBeInstanceOf(z.ZodError); // age is taken as string, must be coerced to number
});

test("parseCSV fails when invalid data is given (rows are not the same size)", async () => {
  const strSchema = z.tuple([(z.string()), (z.string()), (z.string()), (z.string())]);
  const results = await parseCSV(WRONG_CSV_PATH, strSchema)

  expect(results).toBeInstanceOf(z.ZodError); // second row only has 2 fields
});

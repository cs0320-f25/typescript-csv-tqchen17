# Sprint 1: TypeScript CSV

### Task C: Proposing Enhancement

- #### Step 1: Brainstorm on your own.

Bug: Column labels are always included in the results data even though they shouldn't be. User should configure whether header data is included or not. 
Bug: Commas (as a part of data within "") are not correctly parsed, messing up the structure and intention. Double quotes should not be included when used for this case either. 
Enhancement: Parse integer/decimal data as numbers rather than strings. Boolean parsing would be appreciated as well. Could configure the data to match a user schema. 
Enhancement: If the csv has invalid data (not every entry has the same # of fields), caller should be notified of missing/extraneous data. Excluding cases of missing data explicitly noted in the csv (ex: name,age,gender,grade |-> abe,,,freshman)

- #### Step 2: Use an LLM to help expand your perspective.

There was overlap with type inferencing, the heading labels issue, and quoted fields issue, which I feel matches with the idea of a very "correct" CSV parser for the problem outlined. The LLM suggests additional features like delimiter flexibility (letting the user choose it with default ","), newline variations, and streaming large files. It's interesting how personal it got with the user experience since it tried to ensure any semblance of CSV data could be used (delimiter flexibility) and any person could use the parser easily (handling both Unix and Windows newlines ("\n", "\r\n")). 

1. I modified the prompt to not specify the language (removing Typescript) and some aspects, like the common CSV features that could be missing, remained the same. In the improvements for developer experience, the new message also contained a Typescript example with parseCSV taking in a configurable API, while the original message did not have this suggestion but also included examples of Typescript for Typescript generics and streaming rows. It also replaced the "Edge Cases" section with "Developer-Friendly Extras", which surprised me since that part of the prompt did not change. 

2. I modified the prompt to look for possible bugs rather than missing features/edge cases and to find enhancements to make the CSV parser as robust as possible rather than mentioning the reason (for developers to use in other apps). The output here changed quite a bit, though many of the same points like delimiters, quoted fields, and header row issues remained. In the robustness points, it mentioned a lot of new features like header handling, validation, and performance, but it missed some seemingly easy choices like typed output, pluggable transformers, and friendly integration. In changing the prompt, the message lost a lot of the specificity of the original. 

- #### Step 3: use an LLM to help expand your perspective.

    Include a list of the top 4 enhancements or edge cases you think are most valuable to explore in the next week’s sprint. Label them clearly by category (extensibility vs. functionality), and include whether they came from you, the LLM, or both. Describe these using the User Story format—see below for a definition. 

    Functionality - Both: 
    As a user of the application, I am able to use the CSV quoting functionality (as defined in the doc) so that I can include commas and intentional double quotes in my data without the parser separating it out.
    Acceptance Criteria:
    - The user can place double quotes to signify when data is meant to be kept together, regardless of the delimiters inside.
    - The user can include double quotes in their data by surrounding it with double quotes as well. 
    - The parser returns the information in the double quotes as one element. 
    
    Functionality - Both: 
    As a user of the application, I am able to send in metadata marking whether column headers are included so that I can ensure that the parsed data returned never contains headers regardless if they are in the original CSV file.
    Acceptance Criteria:
    - The user can include an argument in the parse_csv call that signifies whether headers are included or not. The argument defaults to false if not included. 
    - The parser returns all rows except the first row if true, all rows if false. 

    Extensibility - Both: 
    As a user of the application, I am able to send in my desired schema configuration so that I can have my data automatically parsed to the types that I want.
    Acceptance Criteria:
    - The user can include an argument in the parse_csv call of their desired schema configuration. The argument defaults to none if not included. 
    - The parser returns the data in rows strictly adhering schema specifications or in strings if schema is not specified. 
    
    Extensibility - Both: 
    As a user of the application, I am able to know when and where my data is malformed so that I caan make the necessary modifications to the CSV file and know where data might be skewed/erroneous.
    Acceptance Criteria: 
    - An error with the row number is returned if the data is malformed, meaning if any row is missing or has extra columns. 
    - Empty data (, ,) is accepted as non-erroneous if the rule above is followed. 

    Include your notes from above: what were your initial ideas, what did the LLM suggest, and how did the results differ by prompt? What resonated with you, and what didn’t? (3-5 sentences.) 
    
    My initial ideas were to exclude headers if present, correctly parse commas using the quoting CSV functionality (as defined in the doc), parse data as their respective types (column of numbers/bools/etc.), and handling invalid data. The LLM suggested most of my initial ideas with more specific solutions and included a lot of specific developer features like delimiter flexibility, newline variations, and streaming large files. The results when I removed typescript from the prompt were pretty similar but when I changed the goal to robustness, it focused a lot more on general concepts like validation and performance. I resonated with the way that the LLM tried to solve the issues like including a configurable API example for sending in data, but I thought some of the suggestions felt superfluous like when it went into encoding options. 

### Design Choices

### 1340 Supplement

- #### 1. Correctness

The CSV parser takes in a CSV file and returns an array of objects defined by the user. When data is invalid, meaning when each row is not the same size, the CSV parser must always alert the user of this because it could mess up the formatting of all the data (items could be in the wrong columns), which would ruin any data manipulation thereafter. By the CSV parser definition, it needs to handle quoting, so that commas and quotes can be included in data. If data is missing but marked (so each row is still the same size), then the CSV parser should commence and use the type default in that field or a chosen default to not skew the data. 

- #### 2. Random, On-Demand Generation

With random, on-demand generation, I could do many more coercion tests to have a better specification on what passes and fails. For example, numbers clearly must be in a certain format to pass but booleans seem to take in much more, so I would have a more concrete ruleset and possibly implement property testing there. I could also have more powerful edge case testing like with quoting, unicode, etc, with random CSV generation. This could also be helpful for performance testing later on if I wanted to implement streaming speed ups like the LLM suggested.   

- #### 3. Overall experience, Bugs encountered and resolved
#### Errors/Bugs:
Resolved type error bugs that popped up while I was playing around with the parse_csv function header. Apart from that, no bugs appear when calling npm run test or npm run run. Two tests fail intentionally as outlined below.
#### Tests:
I created two testing suites (all under basic-parser.test.ts). 
The first was for part A before the schema implementation where I tested how the parse_csv dealt with varying sizes, whitespace, blank data, inconsistent data, column labels, and quoting. Most of the ideas came from the "definition" of a CSV parser as outlined in the Sprint 1 document. Two tests fail (as intended): failed to exclude headers and incorrect comma parsing. 
The second suite was for part C to test the schema implementation where I tested schema format, multiple different types, blank data, and invalid data (different types than required or row inconsistency). I checked for the failure/invalid cases that a ZodError was returned and for the rest, the data came out parsed correctly. 
#### How To…
run the tests provided: npm run test
build and run program: npm run run
- Change DATA_FILE to modify the input. 
- Create a schema and replace undefined to modify the array objects.

#### Team members and contributions (include cs logins):

#### Collaborators (cslogins of anyone you worked with on this project and/or generative AI): Used Copilot to explain type bug with the quick fix - explain functionality on VSCode. This was a prompt: @workspace /explain Element implicitly has an 'any' type because expression of type '0' can't be used to index type 'string[][] | unknown[] | ZodError<unknown>'. Property '0' does not exist on type 'string[][] | unknown[] | ZodError<unknown>'. Changed small snippets (using Copilot guidance) to fix the type erroring bugs. 
#### Total estimated time it took to complete project: 3 hours
#### Link to GitHub Repo: https://github.com/cs0320-f25/typescript-csv-tqchen17.git

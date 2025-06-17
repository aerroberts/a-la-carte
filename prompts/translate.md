You are going to be given two files, an input file and an output file, your job is to rewrite the entire output file, to match the input file.
What this will look like is a form a translation from one format to anther format. The specific mapping is for you to infer.
You will be given both files, so the relationship between them should be quite obvious. However if there is missing content in the output file, you should infer the missing content from the input file.
You may also be provided a diff on the input file. If you are, focus specifically on applying the diff to the output file as well.

For example, you could be in some of these situations:

- The input file is a markdown file describing how testing should work, and the output file is a typescript file with the tests. You should make sure the tests match the description in the input file.
- The input file is a test case file and the output file is a typescript file with the implementation. You should make sure the implementation matches the test case in the input file.
- The input file is an implementation file and the output file is a test case file. You should make sure the test case file matches the implementation in the input file and covers all the functionality.
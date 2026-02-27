#!/bin/bash

# List of Categories
categories=(
    "C++%20BASICS"
    "C++%20STL"
    "MATH%20FOR%20BEGINNERS"
    "CODEFORCES%20PROBLEM%20A%20GRIND"
    "GREEDY%20ALGORITHMS"
    "RECURSION%20AND%20BACKTRACKING"
    "BIT%20MANIPULATION"
    "PREFIX%20SUMS%20AND%20DIFFERENCE%20ARRAY"
    "CONSTRUCTIVE%20ALGORITHMS"
    "CODEFORCES%20PROBLEM%20B%20GRIND"
    "BINARY%20SEARCH"
    "TWO%20POINTERS"
    "NUMBER%20THEORY"
    "CODEFORCES%20PROBLEM%20C%20GRIND"
    "INTERACTIVE%20PROBLEMS"
    "DP"
    "GRAPHS"
    "DSU"
    "SEGMENT%20TREES%20AND%20LAZY%20PROPAGATION"
    "CODEFORCES%20PROBLEM%20D%20GRIND"
    "NON-STANDARD%20DP%20PROBLEMS"
    "NON-STANDARD%20GRAPH%20PROBLEMS"
    "ADVANCED%20NUMBER%20THEORY"
    "COMBINATORICS%20AND%20PROBABILITY"
)

output_file="all_problem_links.txt"
> "$output_file"

echo "Scraping problem links from all categories..."

for cat in "${categories[@]}"; do
    echo "Processing category: ${cat//%20/ }"
    curl -s "https://ask-senior-server.vercel.app/questions/$cat" | jq -r '.[].link' >> "$output_file"
done

echo "Done! All links saved to $output_file"

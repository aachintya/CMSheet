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

output_file="problems_with_categories.json"
temp_stream="temp_stream.json"
> "$temp_stream"

for cat in "${categories[@]}"; do
    clean_cat="${cat//%20/ }"
    echo "Processing category: $clean_cat"
    
    # Fetch questions for this category
    content=$(curl -s "https://ask-senior-server.vercel.app/questions/$cat")
    
    # Check if content is a valid JSON array
    if echo "$content" | jq -e '. | type == "array"' > /dev/null 2>&1; then
        # Add category field to each problem in the array and append to stream
        echo "$content" | jq -c --arg cat "$clean_cat" '.[] | . + {category: $cat}' >> "$temp_stream"
    else
        echo "Warning: Invalid JSON or empty response for category $clean_cat"
    fi
done

# Wrap the stream into a valid JSON array
jq -s '.' "$temp_stream" > "$output_file"
rm "$temp_stream"

echo "Done! Data saved to $output_file"

import type { ArenaProblem, EditorLanguage, ProblemCategory } from "../../types/arena";

export const ARENA_PROBLEMS: ArenaProblem[] = [
  {
    slug: "two-sum",
    title: "Two Sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    category: "arrays",
    acceptanceRate: 52.4,
    entryPoint: "twoSum",
    statement: `Given an array of integers \`nums\` and an integer \`target\`, return indices of the two numbers such that they add up to \`target\`.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    constraints: [
      "2 <= nums.length <= 10^4",
      "-10^9 <= nums[i] <= 10^9",
      "-10^9 <= target <= 10^9",
      "Only one valid answer exists.",
    ],
    examples: [
      {
        input: "nums = [2,7,11,15], target = 9",
        output: "[0,1]",
        explanation: "Because nums[0] + nums[1] == 9, we return [0, 1].",
      },
      {
        input: "nums = [3,2,4], target = 6",
        output: "[1,2]",
      },
    ],
    hints: [
      "A brute force approach checks every pair — can you do better?",
      "As you scan the array, what information do you need from elements you've already seen?",
      "Store each value and its index in a hash map, then look up target - current.",
    ],
    testCases: [
      { id: 1, label: "nums=[2,7,11,15], target=9", input: { nums: [2, 7, 11, 15], target: 9 }, expected: [0, 1] },
      { id: 2, label: "nums=[3,2,4], target=6", input: { nums: [3, 2, 4], target: 6 }, expected: [1, 2] },
      { id: 3, label: "nums=[3,3], target=6", input: { nums: [3, 3], target: 6 }, expected: [0, 1] },
    ],
    mentor: {
      complexity: "Optimal: O(n) time, O(n) space with a hash map. Brute force is O(n²).",
      optimization: "One pass is enough — store complements as you iterate instead of two loops.",
      approach: [
        "Iterate through nums with index i",
        "Compute complement = target - nums[i]",
        "If complement exists in map, return [map[complement], i]",
        "Otherwise store nums[i] -> i in the map",
      ],
    },
    solutionSteps: [
      { title: "Brute force baseline", explanation: "Check every pair (i, j) where i < j and nums[i] + nums[j] === target." },
      {
        title: "Hash map lookup",
        explanation: "For each index, check if target - nums[i] was seen before.",
        code: "if (seen.has(complement)) return [seen.get(complement), i];",
      },
      {
        title: "Store current value",
        explanation: "Record nums[i] and its index before moving to the next element.",
        code: "seen.set(nums[i], i);",
      },
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
  // Write your solution here

}`,
      python: `def two_sum(nums, target):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}`,
      cpp: `class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};`,
    },
  },
  {
    slug: "valid-parentheses",
    title: "Valid Parentheses",
    difficulty: "Easy",
    tags: ["String", "Stack"],
    category: "strings",
    acceptanceRate: 41.2,
    entryPoint: "isValid",
    statement: `Given a string \`s\` containing just the characters \`'('\`, \`')'\`, \`'{'\`, \`'}'\`, \`'['\` and \`']'\`, determine if the input string is valid.

An input string is valid if open brackets are closed by the same type in the correct order.`,
    constraints: ["1 <= s.length <= 10^4", "s consists of parentheses only '()[]{}'."],
    examples: [
      { input: 's = "()"', output: "true" },
      { input: 's = "([)]"', output: "false" },
      { input: 's = "{[]}"', output: "true" },
    ],
    hints: [
      "Closing brackets must match the most recent unmatched opening bracket.",
      "Use a stack: push opens, pop and verify on closes.",
      "If the stack is empty at the end, the string is valid.",
    ],
    testCases: [
      { id: 1, label: 's="()"', input: { s: "()" }, expected: true },
      { id: 2, label: 's="([)]"', input: { s: "([)]" }, expected: false },
      { id: 3, label: 's="{[]}"', input: { s: "{[]}" }, expected: true },
      { id: 4, label: 's="]"', input: { s: "]" }, expected: false },
    ],
    mentor: {
      complexity: "O(n) time, O(n) space for the stack in the worst case.",
      optimization: "Early exit when a closing bracket does not match the stack top.",
      approach: [
        "Map each closing bracket to its opening partner",
        "Push opening brackets onto a stack",
        "On closing brackets, pop and verify the match",
        "Return stack.length === 0",
      ],
    },
    solutionSteps: [
      { title: "Bracket pairs", explanation: "Create a map: ')' -> '(', ']' -> '[', '}' -> '{'." },
      {
        title: "Stack push/pop",
        explanation: "Push opening chars; on closing chars, pop and compare.",
        code: "if (!stack.length || stack.pop() !== pairs[c]) return false;",
      },
    ],
    starterCode: {
      javascript: `function isValid(s) {
  // Write your solution here

}`,
      python: `def is_valid(s):
    # Write your solution here
    pass`,
      java: `class Solution {
    public boolean isValid(String s) {
        // Write your solution here
        return false;
    }
}`,
      cpp: `class Solution {
public:
    bool isValid(string s) {
        // Write your solution here
        return false;
    }
};`,
    },
  },
  {
    slug: "merge-intervals",
    title: "Merge Intervals",
    difficulty: "Medium",
    tags: ["Array", "Sorting"],
    category: "arrays",
    acceptanceRate: 48.7,
    entryPoint: "merge",
    statement: `Given an array of \`intervals\` where \`intervals[i] = [start_i, end_i]\`, merge all overlapping intervals and return the result.`,
    constraints: [
      "1 <= intervals.length <= 10^4",
      "intervals[i].length == 2",
      "0 <= start_i <= end_i <= 10^4",
    ],
    examples: [
      {
        input: "intervals = [[1,3],[2,6],[8,10],[15,18]]",
        output: "[[1,6],[8,10],[15,18]]",
      },
    ],
    hints: [
      "Sorting by start time simplifies merging.",
      "Compare the current interval with the last merged interval.",
      "Overlap when current start <= last end.",
    ],
    testCases: [
      {
        id: 1,
        label: "[[1,3],[2,6],[8,10],[15,18]]",
        input: { intervals: [[1, 3], [2, 6], [8, 10], [15, 18]] },
        expected: [[1, 6], [8, 10], [15, 18]],
      },
      {
        id: 2,
        label: "[[1,4],[4,5]]",
        input: { intervals: [[1, 4], [4, 5]] },
        expected: [[1, 5]],
      },
    ],
    mentor: {
      complexity: "O(n log n) from sorting; merge pass is O(n).",
      optimization: "Sort once, then single linear scan with a result array.",
      approach: [
        "Sort intervals by start",
        "Initialize result with the first interval",
        "For each next interval, merge or append",
      ],
    },
    solutionSteps: [
      { title: "Sort by start", explanation: "intervals.sort((a, b) => a[0] - b[0])" },
      {
        title: "Merge or append",
        explanation: "If overlap, extend the last interval's end; otherwise push a new interval.",
        code: "last[1] = Math.max(last[1], curr[1]);",
      },
    ],
    starterCode: {
      javascript: `function merge(intervals) {
  // Write your solution here

}`,
      python: `def merge(intervals):
    # Write your solution here
    pass`,
      java: `class Solution {
    public int[][] merge(int[][] intervals) {
        // Write your solution here
        return new int[][]{};
    }
}`,
      cpp: `class Solution {
public:
    vector<vector<int>> merge(vector<vector<int>>& intervals) {
        // Write your solution here
        return {};
    }
};`,
    },
  },
];

export const PROBLEM_CATEGORIES: ProblemCategory[] = [
  {
    id: "arrays",
    name: "Arrays & Hashing",
    description: "Two pointers, sliding window, and hash maps.",
    icon: "grid",
    color: "from-purple-500 to-violet-600",
  },
  {
    id: "strings",
    name: "Strings",
    description: "Parsing, stacks, and pattern matching.",
    icon: "type",
    color: "from-sky-500 to-cyan-500",
  },
  {
    id: "trees",
    name: "Trees & Graphs",
    description: "BFS, DFS, and traversal patterns.",
    icon: "git-branch",
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "dp",
    name: "Dynamic Programming",
    description: "Memoization and optimal substructure.",
    icon: "layers",
    color: "from-amber-500 to-orange-500",
  },
];

export function getProblemBySlug(slug: string): ArenaProblem | undefined {
  return ARENA_PROBLEMS.find((p) => p.slug === slug);
}

export function getProblemsByCategory(categoryId: string): ArenaProblem[] {
  return ARENA_PROBLEMS.filter((p) => p.category === categoryId);
}

export function getCategoryProblemCount(categoryId: string): number {
  return getProblemsByCategory(categoryId).length;
}

export function getDailyChallengeSlug(): string {
  const slugs = ARENA_PROBLEMS.map((p) => p.slug);
  const dayIndex = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000
  );
  return slugs[dayIndex % slugs.length];
}

export function getStarterCode(problem: ArenaProblem, lang: EditorLanguage): string {
  return problem.starterCode[lang];
}

export const MONACO_LANGUAGE_MAP: Record<EditorLanguage, string> = {
  python: "python",
  cpp: "cpp",
  java: "java",
  javascript: "javascript",
};

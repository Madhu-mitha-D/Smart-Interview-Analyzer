CODING_QUESTIONS = [
    {
        "id": "reverse_string",
        "title": "Reverse String",
        "difficulty": "easy",
        "tags": ["String", "Two Pointers"],
        "statement": "Write a function that returns the reversed version of the input string.",
        "constraints": [
            "0 <= len(s) <= 10^5",
            "s contains printable ASCII characters",
        ],
        "examples": [
            {
                "input": "s = 'hello'",
                "output": "'olleh'",
                "explanation": "The string is reversed character by character.",
            },
            {
                "input": "s = 'madam'",
                "output": "'madam'",
                "explanation": "A palindrome stays the same after reversal.",
            },
        ],
        "function_name": {
            "python": "reverse_string",
            "java": "reverseString",
            "cpp": "reverseString",
        },
        "starter_code": {
            "python": """def reverse_string(s):
    # Write your code here
    pass
""",
            "java": """public class Main {
    public static String reverseString(String s) {
        // Write your code here
        return "";
    }

    public static void main(String[] args) {
        System.out.println(reverseString("hello"));
    }
}
""",
            "cpp": """#include <bits/stdc++.h>
using namespace std;

string reverseString(string s) {
    // Write your code here
    return "";
}

int main() {
    cout << reverseString("hello") << endl;
    return 0;
}
""",
        },
        "sample_test_cases": [
            {"input": ["hello"], "expected": "olleh"},
        ],
        "hidden_test_cases": [
            {"input": ["hello"], "expected": "olleh"},
            {"input": ["madam"], "expected": "madam"},
            {"input": [""], "expected": ""},
        ],
    },
    {
        "id": "palindrome_check",
        "title": "Palindrome Check",
        "difficulty": "easy",
        "tags": ["String"],
        "statement": "Write a function that returns True if the string is a palindrome, otherwise False.",
        "constraints": [
            "0 <= len(s) <= 10^5",
        ],
        "examples": [
            {
                "input": "s = 'madam'",
                "output": "True",
                "explanation": "The string reads the same forward and backward.",
            },
            {
                "input": "s = 'python'",
                "output": "False",
                "explanation": "The reversed string is different.",
            },
        ],
        "function_name": {
            "python": "is_palindrome",
            "java": "isPalindrome",
            "cpp": "isPalindrome",
        },
        "starter_code": {
            "python": """def is_palindrome(s):
    # Write your code here
    pass
""",
            "java": """public class Main {
    public static boolean isPalindrome(String s) {
        // Write your code here
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isPalindrome("madam"));
    }
}
""",
            "cpp": """#include <bits/stdc++.h>
using namespace std;

bool isPalindrome(string s) {
    // Write your code here
    return false;
}

int main() {
    cout << (isPalindrome("madam") ? "true" : "false") << endl;
    return 0;
}
""",
        },
        "sample_test_cases": [
            {"input": ["madam"], "expected": True},
        ],
        "hidden_test_cases": [
            {"input": ["madam"], "expected": True},
            {"input": ["python"], "expected": False},
            {"input": ["racecar"], "expected": True},
        ],
    },
    {
        "id": "maximum_of_array",
        "title": "Maximum of Array",
        "difficulty": "easy",
        "tags": ["Array"],
        "statement": "Write a function that returns the maximum element in an integer array.",
        "constraints": [
            "1 <= len(nums) <= 10^5",
            "-10^9 <= nums[i] <= 10^9",
        ],
        "examples": [
            {
                "input": "nums = [3, 7, 2, 9, 4]",
                "output": "9",
                "explanation": "9 is the largest value in the array.",
            }
        ],
        "function_name": {
            "python": "find_maximum",
            "java": "findMaximum",
            "cpp": "findMaximum",
        },
        "starter_code": {
            "python": """def find_maximum(nums):
    # Write your code here
    pass
""",
            "java": """public class Main {
    public static int findMaximum(int[] nums) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) {
        int[] nums = {3, 7, 2, 9, 4};
        System.out.println(findMaximum(nums));
    }
}
""",
            "cpp": """#include <bits/stdc++.h>
using namespace std;

int findMaximum(vector<int>& nums) {
    // Write your code here
    return 0;
}

int main() {
    vector<int> nums = {3, 7, 2, 9, 4};
    cout << findMaximum(nums) << endl;
    return 0;
}
""",
        },
        "sample_test_cases": [
            {"input": [[3, 7, 2, 9, 4]], "expected": 9},
        ],
        "hidden_test_cases": [
            {"input": [[3, 7, 2, 9, 4]], "expected": 9},
            {"input": [[-1, -5, -2]], "expected": -1},
        ],
    },
    {
        "id": "valid_parentheses",
        "title": "Valid Parentheses",
        "difficulty": "easy",
        "tags": ["Stack", "String"],
        "statement": "Given a string containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.",
        "constraints": [
            "1 <= len(s) <= 10^4",
            "s contains only brackets ()[]{}",
        ],
        "examples": [
            {
                "input": 's = "()[]{}"',
                "output": "True",
                "explanation": "All brackets are correctly opened and closed.",
            },
            {
                "input": 's = "(]"',
                "output": "False",
                "explanation": "Bracket types do not match.",
            },
        ],
        "function_name": {
            "python": "is_valid_parentheses",
            "java": "isValidParentheses",
            "cpp": "isValidParentheses",
        },
        "starter_code": {
            "python": """def is_valid_parentheses(s):
    # Write your code here
    pass
""",
            "java": """public class Main {
    public static boolean isValidParentheses(String s) {
        // Write your code here
        return false;
    }

    public static void main(String[] args) {
        System.out.println(isValidParentheses("()[]{}"));
    }
}
""",
            "cpp": """#include <bits/stdc++.h>
using namespace std;

bool isValidParentheses(string s) {
    // Write your code here
    return false;
}

int main() {
    cout << (isValidParentheses("()[]{}") ? "true" : "false") << endl;
    return 0;
}
""",
        },
        "sample_test_cases": [
            {"input": ["()[]{}"], "expected": True},
        ],
        "hidden_test_cases": [
            {"input": ["()[]{}"], "expected": True},
            {"input": ["(]"], "expected": False},
            {"input": ["{[]}"], "expected": True},
        ],
    },
    {
        "id": "first_non_repeating_easy",
        "title": "First Non-Repeating Character",
        "difficulty": "easy",
        "tags": ["String", "Hash Map"],
        "statement": "Return the first non-repeating character in a string, or None/null if there is no such character.",
        "constraints": [
            "0 <= len(s) <= 10^5",
        ],
        "examples": [
            {
                "input": "s = 'aabbcddee'",
                "output": "'c'",
                "explanation": "c is the first character with frequency 1.",
            }
        ],
        "function_name": {
            "python": "first_non_repeating",
            "java": "firstNonRepeating",
            "cpp": "firstNonRepeating",
        },
        "starter_code": {
            "python": """def first_non_repeating(s):
    # Write your code here
    pass
""",
            "java": """public class Main {
    public static Character firstNonRepeating(String s) {
        // Write your code here
        return null;
    }

    public static void main(String[] args) {
        System.out.println(firstNonRepeating("aabbcddee"));
    }
}
""",
            "cpp": """#include <bits/stdc++.h>
using namespace std;

char firstNonRepeating(string s) {
    // Write your code here
    return '\\0';
}

int main() {
    char ans = firstNonRepeating("aabbcddee");
    if (ans == '\\0') cout << "null" << endl;
    else cout << ans << endl;
    return 0;
}
""",
        },
        "sample_test_cases": [
            {"input": ["aabbcddee"], "expected": "c"},
        ],
        "hidden_test_cases": [
            {"input": ["aabbcddee"], "expected": "c"},
            {"input": ["aabbcc"], "expected": None},
        ],
    },
    {
        "id": "merge_sorted_arrays",
        "title": "Merge Sorted Arrays",
        "difficulty": "easy",
        "tags": ["Array", "Two Pointers"],
        "statement": "Given two sorted arrays, return a single merged sorted array.",
        "constraints": [
            "0 <= len(nums1), len(nums2) <= 10^5",
        ],
        "examples": [
            {
                "input": "nums1 = [1,3,5], nums2 = [2,4,6]",
                "output": "[1,2,3,4,5,6]",
                "explanation": "Merge both arrays in sorted order.",
            }
        ],
        "function_name": {
            "python": "merge_sorted_arrays",
            "java": "mergeSortedArrays",
            "cpp": "mergeSortedArrays",
        },
        "starter_code": {
            "python": """def merge_sorted_arrays(nums1, nums2):
    # Write your code here
    pass
""",
            "java": """import java.util.*;

public class Main {
    public static int[] mergeSortedArrays(int[] nums1, int[] nums2) {
        // Write your code here
        return new int[]{};
    }

    public static void main(String[] args) {
        int[] nums1 = {1, 3, 5};
        int[] nums2 = {2, 4, 6};
        System.out.println(Arrays.toString(mergeSortedArrays(nums1, nums2)));
    }
}
""",
            "cpp": """#include <bits/stdc++.h>
using namespace std;

vector<int> mergeSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    // Write your code here
    return {};
}

int main() {
    vector<int> nums1 = {1, 3, 5};
    vector<int> nums2 = {2, 4, 6};
    vector<int> ans = mergeSortedArrays(nums1, nums2);
    for (int x : ans) cout << x << " ";
    return 0;
}
""",
        },
        "sample_test_cases": [
            {"input": [[1, 3, 5], [2, 4, 6]], "expected": [1, 2, 3, 4, 5, 6]},
        ],
        "hidden_test_cases": [
            {"input": [[1, 3, 5], [2, 4, 6]], "expected": [1, 2, 3, 4, 5, 6]},
            {"input": [[], [1, 2]], "expected": [1, 2]},
        ],
    },

    {
        "id": "two_sum",
        "title": "Two Sum",
        "difficulty": "medium",
        "tags": ["Array", "Hash Map"],
        "statement": "Return indices of the two numbers such that they add up to the target.",
        "constraints": [
            "2 <= len(nums) <= 10^4",
            "Exactly one valid answer exists",
        ],
        "examples": [
            {
                "input": "nums = [2,7,11,15], target = 9",
                "output": "[0,1]",
                "explanation": "nums[0] + nums[1] = 9",
            },
            {
                "input": "nums = [3,2,4], target = 6",
                "output": "[1,2]",
                "explanation": "nums[1] + nums[2] = 6",
            },
        ],
        "function_name": {
            "python": "two_sum",
            "java": "twoSum",
            "cpp": "twoSum",
        },
        "starter_code": {
            "python": """def two_sum(nums, target):
    # Write your code here
    pass
""",
            "java": """import java.util.*;

public class Main {
    public static int[] twoSum(int[] nums, int target) {
        // Write your code here
        return new int[]{};
    }

    public static void main(String[] args) {
        int[] nums = {2, 7, 11, 15};
        int target = 9;
        System.out.println(Arrays.toString(twoSum(nums, target)));
    }
}
""",
            "cpp": """#include <bits/stdc++.h>
using namespace std;

vector<int> twoSum(vector<int>& nums, int target) {
    // Write your code here
    return {};
}

int main() {
    vector<int> nums = {2, 7, 11, 15};
    int target = 9;
    vector<int> ans = twoSum(nums, target);
    cout << "[" << ans[0] << "," << ans[1] << "]" << endl;
    return 0;
}
""",
        },
        "sample_test_cases": [
            {"input": [[2, 7, 11, 15], 9], "expected": [0, 1]},
        ],
        "hidden_test_cases": [
            {"input": [[2, 7, 11, 15], 9], "expected": [0, 1]},
            {"input": [[3, 2, 4], 6], "expected": [1, 2]},
        ],
    },
    {
        "id": "binary_search",
        "title": "Binary Search",
        "difficulty": "medium",
        "tags": ["Array", "Binary Search"],
        "statement": "Given a sorted array and a target, return its index if found, otherwise return -1.",
        "constraints": [
            "1 <= len(nums) <= 10^5",
            "nums is sorted in ascending order",
        ],
        "examples": [
            {
                "input": "nums = [1,3,5,7,9], target = 7",
                "output": "3",
                "explanation": "7 is present at index 3.",
            }
        ],
        "function_name": {
            "python": "binary_search",
            "java": "binarySearch",
            "cpp": "binarySearch",
        },
        "starter_code": {
            "python": """def binary_search(nums, target):
    # Write your code here
    pass
""",
            "java": """public class Main {
    public static int binarySearch(int[] nums, int target) {
        // Write your code here
        return -1;
    }

    public static void main(String[] args) {
        int[] nums = {1, 3, 5, 7, 9};
        System.out.println(binarySearch(nums, 7));
    }
}
""",
            "cpp": """#include <bits/stdc++.h>
using namespace std;

int binarySearch(vector<int>& nums, int target) {
    // Write your code here
    return -1;
}

int main() {
    vector<int> nums = {1, 3, 5, 7, 9};
    cout << binarySearch(nums, 7) << endl;
    return 0;
}
""",
        },
        "sample_test_cases": [
            {"input": [[1, 3, 5, 7, 9], 7], "expected": 3},
        ],
        "hidden_test_cases": [
            {"input": [[1, 3, 5, 7, 9], 7], "expected": 3},
            {"input": [[1, 2, 3, 4], 5], "expected": -1},
        ],
    },
    {
        "id": "maximum_subarray",
        "title": "Maximum Subarray",
        "difficulty": "medium",
        "tags": ["Array", "Dynamic Programming"],
        "statement": "Find the contiguous subarray with the largest sum and return its sum.",
        "constraints": [
            "1 <= len(nums) <= 10^5",
            "-10^4 <= nums[i] <= 10^4",
        ],
        "examples": [
            {
                "input": "nums = [-2,1,-3,4,-1,2,1,-5,4]",
                "output": "6",
                "explanation": "The subarray [4,-1,2,1] has the largest sum 6.",
            }
        ],
        "function_name": {
            "python": "max_subarray",
            "java": "maxSubarray",
            "cpp": "maxSubarray",
        },
        "starter_code": {
            "python": """def max_subarray(nums):
    # Write your code here
    pass
""",
            "java": """public class Main {
    public static int maxSubarray(int[] nums) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) {
        int[] nums = {-2,1,-3,4,-1,2,1,-5,4};
        System.out.println(maxSubarray(nums));
    }
}
""",
            "cpp": """#include <bits/stdc++.h>
using namespace std;

int maxSubarray(vector<int>& nums) {
    // Write your code here
    return 0;
}

int main() {
    vector<int> nums = {-2,1,-3,4,-1,2,1,-5,4};
    cout << maxSubarray(nums) << endl;
    return 0;
}
""",
        },
        "sample_test_cases": [
            {"input": [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], "expected": 6},
        ],
        "hidden_test_cases": [
            {"input": [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], "expected": 6},
            {"input": [[1]], "expected": 1},
        ],
    },
    {
        "id": "group_anagrams",
        "title": "Group Anagrams",
        "difficulty": "medium",
        "tags": ["Hash Map", "String"],
        "statement": "Group the given list of strings into groups of anagrams.",
        "constraints": [
            "1 <= len(strs) <= 10^4",
        ],
        "examples": [
            {
                "input": 'strs = ["eat","tea","tan","ate","nat","bat"]',
                "output": '[["eat","tea","ate"],["tan","nat"],["bat"]]',
                "explanation": "Strings with same sorted character sequence belong together.",
            }
        ],
        "function_name": {
            "python": "group_anagrams",
            "java": "groupAnagrams",
            "cpp": "groupAnagrams",
        },
        "starter_code": {
            "python": """def group_anagrams(strs):
    # Write your code here
    pass
""",
            "java": """import java.util.*;

public class Main {
    public static List<List<String>> groupAnagrams(String[] strs) {
        // Write your code here
        return new ArrayList<>();
    }

    public static void main(String[] args) {
        String[] strs = {"eat","tea","tan","ate","nat","bat"};
        System.out.println(groupAnagrams(strs));
    }
}
""",
            "cpp": """#include <bits/stdc++.h>
using namespace std;

vector<vector<string>> groupAnagrams(vector<string>& strs) {
    // Write your code here
    return {};
}

int main() {
    vector<string> strs = {"eat","tea","tan","ate","nat","bat"};
    return 0;
}
""",
        },
        "sample_test_cases": [
            {"input": [["eat", "tea", "tan", "ate", "nat", "bat"]], "expected": [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]},
        ],
        "hidden_test_cases": [
            {"input": [["eat", "tea", "tan", "ate", "nat", "bat"]], "expected": [["eat", "tea", "ate"], ["tan", "nat"], ["bat"]]},
        ],
    },
    {
        "id": "longest_unique_substring",
        "title": "Longest Substring Without Repeating Characters",
        "difficulty": "medium",
        "tags": ["String", "Sliding Window"],
        "statement": "Return the length of the longest substring without repeating characters.",
        "constraints": [
            "0 <= len(s) <= 10^5",
        ],
        "examples": [
            {
                "input": "s = 'abcabcbb'",
                "output": "3",
                "explanation": "The answer is 'abc'.",
            }
        ],
        "function_name": {
            "python": "length_of_longest_substring",
            "java": "lengthOfLongestSubstring",
            "cpp": "lengthOfLongestSubstring",
        },
        "starter_code": {
            "python": """def length_of_longest_substring(s):
    # Write your code here
    pass
""",
            "java": """public class Main {
    public static int lengthOfLongestSubstring(String s) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) {
        System.out.println(lengthOfLongestSubstring("abcabcbb"));
    }
}
""",
            "cpp": """#include <bits/stdc++.h>
using namespace std;

int lengthOfLongestSubstring(string s) {
    // Write your code here
    return 0;
}

int main() {
    cout << lengthOfLongestSubstring("abcabcbb") << endl;
    return 0;
}
""",
        },
        "sample_test_cases": [
            {"input": ["abcabcbb"], "expected": 3},
        ],
        "hidden_test_cases": [
            {"input": ["abcabcbb"], "expected": 3},
            {"input": ["bbbbb"], "expected": 1},
            {"input": ["pwwkew"], "expected": 3},
        ],
    },
    {
        "id": "merge_intervals",
        "title": "Merge Intervals",
        "difficulty": "medium",
        "tags": ["Array", "Intervals", "Sorting"],
        "statement": "Merge all overlapping intervals and return the resulting list of intervals.",
        "constraints": [
            "1 <= len(intervals) <= 10^4",
        ],
        "examples": [
            {
                "input": "intervals = [[1,3],[2,6],[8,10],[15,18]]",
                "output": "[[1,6],[8,10],[15,18]]",
                "explanation": "[1,3] and [2,6] overlap, so they are merged.",
            }
        ],
        "function_name": {
            "python": "merge_intervals",
            "java": "mergeIntervals",
            "cpp": "mergeIntervals",
        },
        "starter_code": {
            "python": """def merge_intervals(intervals):
    # Write your code here
    pass
""",
            "java": """import java.util.*;

public class Main {
    public static int[][] mergeIntervals(int[][] intervals) {
        // Write your code here
        return new int[][]{};
    }

    public static void main(String[] args) {}
}
""",
            "cpp": """#include <bits/stdc++.h>
using namespace std;

vector<vector<int>> mergeIntervals(vector<vector<int>>& intervals) {
    // Write your code here
    return {};
}

int main() {
    return 0;
}
""",
        },
        "sample_test_cases": [
            {"input": [[[1, 3], [2, 6], [8, 10], [15, 18]]], "expected": [[1, 6], [8, 10], [15, 18]]},
        ],
        "hidden_test_cases": [
            {"input": [[[1, 3], [2, 6], [8, 10], [15, 18]]], "expected": [[1, 6], [8, 10], [15, 18]]},
        ],
    },

    {
        "id": "trapping_rain_water",
        "title": "Trapping Rain Water",
        "difficulty": "hard",
        "tags": ["Array", "Two Pointers", "Stack"],
        "statement": "Given an array representing elevation map heights, compute how much water it can trap after raining.",
        "constraints": [
            "1 <= len(height) <= 2 * 10^4",
            "0 <= height[i] <= 10^5",
        ],
        "examples": [
            {
                "input": "height = [0,1,0,2,1,0,1,3,2,1,2,1]",
                "output": "6",
                "explanation": "The elevation map traps 6 units of water.",
            }
        ],
        "function_name": {
            "python": "trap_rain_water",
            "java": "trapRainWater",
            "cpp": "trapRainWater",
        },
        "starter_code": {
            "python": """def trap_rain_water(height):
    # Write your code here
    pass
""",
            "java": """public class Main {
    public static int trapRainWater(int[] height) {
        // Write your code here
        return 0;
    }

    public static void main(String[] args) {}
}
""",
            "cpp": """#include <bits/stdc++.h>
using namespace std;

int trapRainWater(vector<int>& height) {
    // Write your code here
    return 0;
}

int main() {
    return 0;
}
""",
        },
        "sample_test_cases": [
            {"input": [[0,1,0,2,1,0,1,3,2,1,2,1]], "expected": 6},
        ],
        "hidden_test_cases": [
            {"input": [[0,1,0,2,1,0,1,3,2,1,2,1]], "expected": 6},
            {"input": [[4,2,0,3,2,5]], "expected": 9},
        ],
    },
    {
        "id": "lru_cache_design",
        "title": "LRU Cache Design",
        "difficulty": "hard",
        "tags": ["Hash Map", "Linked List", "Design"],
        "statement": "Design and implement an LRU Cache with get and put operations.",
        "constraints": [
            "Implement both get and put in O(1) average time complexity.",
        ],
        "examples": [
            {
                "input": "capacity = 2, operations = put/get sequence",
                "output": "Depends on operation order",
                "explanation": "Least recently used item should be evicted first.",
            }
        ],
        "function_name": {
            "python": "lru_cache_demo",
            "java": "lruCacheDemo",
            "cpp": "lruCacheDemo",
        },
        "starter_code": {
            "python": """class LRUCache:
    def __init__(self, capacity):
        # Write your code here
        pass

    def get(self, key):
        pass

    def put(self, key, value):
        pass
""",
            "java": """public class Main {
    static class LRUCache {
        public LRUCache(int capacity) {
            // Write your code here
        }

        public int get(int key) {
            return -1;
        }

        public void put(int key, int value) {
        }
    }

    public static void main(String[] args) {}
}
""",
            "cpp": """#include <bits/stdc++.h>
using namespace std;

class LRUCache {
public:
    LRUCache(int capacity) {
        // Write your code here
    }

    int get(int key) {
        return -1;
    }

    void put(int key, int value) {
    }
};

int main() {
    return 0;
}
""",
        },
        "sample_test_cases": [
            {"input": [2], "expected": None},
        ],
        "hidden_test_cases": [
            {"input": [2], "expected": None},
        ],
    },
    {
        "id": "median_two_sorted_arrays",
        "title": "Median of Two Sorted Arrays",
        "difficulty": "hard",
        "tags": ["Array", "Binary Search", "Divide and Conquer"],
        "statement": "Given two sorted arrays nums1 and nums2, return the median of the two sorted arrays.",
        "constraints": [
            "0 <= len(nums1), len(nums2) <= 1000",
            "Overall run time complexity should be O(log (m+n)) ideally.",
        ],
        "examples": [
            {
                "input": "nums1 = [1,3], nums2 = [2]",
                "output": "2.0",
                "explanation": "Merged array is [1,2,3], median is 2.0.",
            }
        ],
        "function_name": {
            "python": "find_median_sorted_arrays",
            "java": "findMedianSortedArrays",
            "cpp": "findMedianSortedArrays",
        },
        "starter_code": {
            "python": """def find_median_sorted_arrays(nums1, nums2):
    # Write your code here
    pass
""",
            "java": """public class Main {
    public static double findMedianSortedArrays(int[] nums1, int[] nums2) {
        // Write your code here
        return 0.0;
    }

    public static void main(String[] args) {}
}
""",
            "cpp": """#include <bits/stdc++.h>
using namespace std;

double findMedianSortedArrays(vector<int>& nums1, vector<int>& nums2) {
    // Write your code here
    return 0.0;
}

int main() {
    return 0;
}
""",
        },
        "sample_test_cases": [
            {"input": [[1, 3], [2]], "expected": 2.0},
        ],
        "hidden_test_cases": [
            {"input": [[1, 3], [2]], "expected": 2.0},
            {"input": [[1, 2], [3, 4]], "expected": 2.5},
        ],
    },
]
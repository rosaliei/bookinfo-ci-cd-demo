# Test entry point for Bazel's py_test: runs the unit tests and exits
# non-zero on failure (test_productpage.py has no __main__ block).

import unittest

if __name__ == '__main__':
    unittest.main(module='test_productpage', verbosity=2)

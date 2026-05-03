#!/bin/bash
# Add XAMPP PHP to bash PATH permanently

PHP_PATH_LINE='export PATH="/c/xampp/php:$PATH"'

# Add to .bashrc if not already there
if ! grep -q "xampp/php" ~/.bashrc 2>/dev/null; then
  echo "$PHP_PATH_LINE" >> ~/.bashrc
  echo "Added to ~/.bashrc"
else
  echo "Already in ~/.bashrc"
fi

# Add to .bash_profile if not already there
if ! grep -q "xampp/php" ~/.bash_profile 2>/dev/null; then
  echo "$PHP_PATH_LINE" >> ~/.bash_profile
  echo "Added to ~/.bash_profile"
else
  echo "Already in ~/.bash_profile"
fi

# Apply immediately
export PATH="/c/xampp/php:$PATH"

# Test
echo ""
echo "Testing PHP..."
php -v && echo "SUCCESS: PHP is working in Git Bash!"

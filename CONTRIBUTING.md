# Contributing to Otazumi 🎌

First off, thank you for considering contributing to Otazumi! It's people like you that make Otazumi such a great anime streaming platform.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guidelines](#style-guidelines)
- [Commit Messages](#commit-messages)

## 📜 Code of Conduct

This project and everyone participating in it is governed by our Code of Conduct. By participating, you are expected to uphold this code. Please report unacceptable behavior to nishalamv@gmail.com.

### Our Standards

- Be respectful and inclusive
- Welcome newcomers and beginners
- Accept constructive criticism
- Focus on what is best for the community
- Show empathy towards others

## 🤝 How Can I Contribute?

### Reporting Bugs

Before creating bug reports, please check existing issues as you might find that you don't need to create one. When you are creating a bug report, please include as many details as possible:

- **Use a clear and descriptive title**
- **Describe the exact steps to reproduce the problem**
- **Provide specific examples**
- **Describe the behavior you observed and what you expected**
- **Include screenshots if possible**
- **Include your environment details** (OS, browser, Node version)

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion, please include:

- **Use a clear and descriptive title**
- **Provide a detailed description of the suggested enhancement**
- **Explain why this enhancement would be useful**
- **List some examples of how it would work**

### Your First Code Contribution

Unsure where to begin? You can start by looking through these issues:

- `good-first-issue` - Issues that should only require a few lines of code
- `help-wanted` - Issues that should be a bit more involved
- `documentation` - Improvements to documentation

### Pull Requests

1. Fork the repo and create your branch from `main`
2. If you've added code that should be tested, add tests
3. Ensure your code follows the style guidelines
4. Make sure your code lints (`npm run lint`)
5. Update the documentation if needed
6. Write a clear pull request description

## 🛠️ Development Setup

### Prerequisites

- Node.js 18.x or higher
- npm or yarn
- Git

### Setup Steps

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/otazumi.git
cd otazumi

# Add upstream remote
git remote add upstream https://github.com/ORIGINAL_OWNER/otazumi.git

# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run dev
```

### Branch Naming

Use descriptive branch names:
- `feature/subtitle-download-ui` - New features
- `fix/login-error` - Bug fixes
- `docs/readme-update` - Documentation
- `refactor/player-component` - Code refactoring
- `test/auth-service` - Tests

## 🔄 Pull Request Process

1. **Update Documentation**: Ensure any new features are documented
2. **Update README**: Add notes about new dependencies or setup steps
3. **Test Thoroughly**: Test your changes across different browsers
4. **Clean Commits**: Squash commits if necessary
5. **Follow Style Guide**: Ensure code matches existing style
6. **Pass CI Checks**: All automated checks must pass
7. **Request Review**: Request review from maintainers
8. **Be Responsive**: Address feedback promptly

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
How has this been tested?

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings
- [ ] Tests added/updated
- [ ] Changes work on mobile
```

## 🎨 Style Guidelines

### JavaScript/React

- Use functional components with hooks
- Follow ESLint configuration
- Use meaningful variable names
- Keep functions small and focused
- Add comments for complex logic
- Use async/await over promises

```javascript
// Good
const handleSubmit = async () => {
  try {
    const result = await api.submitForm(data);
    setSuccess(true);
  } catch (error) {
    setError(error.message);
  }
};

// Avoid
function handleSubmit() {
  api.submitForm(data).then(result => {
    setSuccess(true);
  }).catch(error => {
    setError(error.message);
  });
}
```

### CSS/Tailwind

- Use Tailwind utilities when possible
- Follow mobile-first responsive design
- Keep custom CSS minimal
- Use consistent spacing scale
- Maintain dark theme consistency

```jsx
// Good
<button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white">
  Click Me
</button>

// Avoid inline styles when Tailwind works
<button style={{padding: '8px 16px', background: '#2563eb'}}>
  Click Me
</button>
```

### File Organization

```
components/
├── ComponentName/
│   ├── ComponentName.jsx
│   ├── ComponentName.css
│   └── index.js (optional)
```

### Component Structure

```javascript
import { useState, useEffect } from 'react';
import './ComponentName.css';

const ComponentName = ({ prop1, prop2 }) => {
  // State
  const [state, setState] = useState(initialValue);
  
  // Effects
  useEffect(() => {
    // Effect logic
  }, [dependencies]);
  
  // Handlers
  const handleAction = () => {
    // Handler logic
  };
  
  // Render
  return (
    <div className="component-name">
      {/* JSX */}
    </div>
  );
};

export default ComponentName;
```

## 📝 Commit Messages

Follow conventional commits format:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no code change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```
feat(player): add quality selection dropdown

Added a quality selector to the video player that allows
users to switch between 360p, 480p, 720p, and 1080p.

Closes #123
```

```
fix(auth): resolve login token expiry issue

Fixed bug where JWT tokens were expiring too quickly
by adjusting the expiry time to 7 days.

Fixes #456
```

## 🧪 Testing

- Write tests for new features
- Update tests when fixing bugs
- Ensure all tests pass before submitting PR
- Test on multiple browsers (Chrome, Firefox, Safari)
- Test responsive design on different screen sizes

## 📚 Documentation

- Update README.md for new features
- Add JSDoc comments for functions
- Update relevant .md files in /docs
- Include examples in documentation
- Keep documentation up to date with code changes

## 🔍 Code Review Process

Maintainers will review your PR and may:
- Request changes
- Ask questions
- Suggest improvements
- Approve and merge

Be patient and responsive to feedback. Remember, reviews help improve code quality!

## 🎯 Priority Areas

We're especially looking for contributions in:

- 📱 Mobile app development (React Native)
- 🌍 Internationalization (i18n)
- ♿ Accessibility improvements
- 🎨 UI/UX enhancements
- 📝 Documentation improvements
- 🧪 Test coverage
- 🐛 Bug fixes

## 💬 Questions?

- Open a discussion on GitHub
- Join our Discord (if available)
- Email: contribute@otazumi.com

## 🌟 Recognition

Contributors will be:
- Added to CONTRIBUTORS.md
- Mentioned in release notes
- Given credit in the app (for major contributions)

Thank you for contributing to Otazumi! 🎌✨

---

Happy coding! If you have any questions, don't hesitate to ask.

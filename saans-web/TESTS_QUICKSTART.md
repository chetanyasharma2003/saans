# Tests Quick Start Guide

Get running with SAANS tests in 2 minutes!

## Installation

```bash
cd saans-web
npm install
```

## Run Tests

### All Tests
```bash
npm run test
```

### Watch Mode (for development)
```bash
npm run test:watch
```

### With Coverage
```bash
npm run test:coverage
```

### Open Test UI
```bash
npm run test:ui
```

## Common Commands

### Run Specific Test
```bash
npm run test -- -t "should login"
```

### Run Single File
```bash
npm run test -- src/__tests__/auth.test.tsx
```

### Verbose Output
```bash
npm run test -- --reporter=verbose
```

### See Coverage Report
After running `npm run test:coverage`:
```bash
open coverage/index.html
```

## File Structure

```
src/
├── __tests__/              # All test files
│   ├── auth.test.tsx       # Login, register, password reset
│   ├── pages.test.tsx      # All page components
│   ├── components.test.tsx # Reusable components
│   ├── utils.test.tsx      # Redux & utilities
│   ├── api.test.tsx        # API endpoints
│   ├── integration.test.tsx# End-to-end flows
│   └── README.md           # Detailed test docs
├── test/
│   ├── setup.ts            # Test utilities
│   └── mocks.ts            # Mock data
├── vitest.config.ts        # Test configuration
└── vitest.setup.ts         # Global setup

```

## Writing a Test

### Simple Test
```typescript
import { describe, it, expect } from 'vitest';

describe('Math', () => {
  it('should add numbers', () => {
    expect(2 + 2).toBe(4);
  });
});
```

### Component Test
```typescript
import { renderWithRedux, AUTHENTICATED_STATE } from '../test/setup';
import { MyComponent } from '../components/MyComponent';

it('should render component', () => {
  renderWithRedux(<MyComponent />, { 
    preloadedState: AUTHENTICATED_STATE 
  });
  
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

### API Test
```typescript
import axios from 'axios';

vi.mock('axios');

it('should fetch data', async () => {
  vi.spyOn(axios, 'get').mockResolvedValueOnce({
    data: { users: [] }
  });

  const response = await axios.get('/api/users');
  expect(response.data.users).toEqual([]);
});
```

## Test Utilities

### Render with Redux
```typescript
const { store } = renderWithRedux(<Component />, {
  preloadedState: AUTHENTICATED_STATE
});
```

### User Interactions
```typescript
const user = userEvent.setup();
await user.type(input, 'text');
await user.click(button);
```

### Async Operations
```typescript
await waitFor(() => {
  expect(element).toBeInTheDocument();
});
```

### Screen Queries
```typescript
screen.getByRole('button', { name: /submit/i })
screen.getByLabelText(/email/i)
screen.getByText(/welcome/i)
```

## Test Coverage

### View Report
```bash
npm run test:coverage
open coverage/index.html
```

### Coverage Targets
- Overall: 75%+
- Components: 80%+
- Utilities: 90%+
- Critical paths: 100%

### Check Specific File
```bash
npm run test:coverage -- src/pages/LoginPage.tsx
```

## Debugging

### Run Single Test Only
```bash
npm run test -- -t "should login user"
```

### Verbose Output
```bash
npm run test -- --reporter=verbose
```

### Debug in Browser
```bash
npm run test:ui
```

Opens browser UI at `http://localhost:51204`

### Console Logs in Tests
```typescript
it('test', () => {
  console.log('Debug:', data);
  // Visible in --reporter=verbose output
});
```

## Mocking

### Mock Axios
```typescript
vi.spyOn(axios, 'post').mockResolvedValueOnce({
  data: { success: true }
});
```

### Mock localStorage
```typescript
setupLocalStorage(); // Already done in tests
localStorage.setItem('key', 'value');
```

### Mock Function
```typescript
const mockFn = vi.fn();
mockFn('arg');
expect(mockFn).toHaveBeenCalledWith('arg');
```

## Common Issues

| Issue | Solution |
|-------|----------|
| Test timeout | Increase timeout: `it('test', () => {...}, 10000)` |
| Mock not working | Ensure mock is before component render |
| State not updating | Use `waitFor()` for async operations |
| Element not found | Check query type and text match |
| Redux state missing | Pass `preloadedState` to `renderWithRedux` |

## Next Steps

1. **Read full docs**: See `TEST_IMPLEMENTATION_GUIDE.md`
2. **Explore tests**: Check `src/__tests__/README.md`
3. **Run tests**: `npm run test`
4. **View coverage**: `npm run test:coverage`
5. **Write more**: Add tests for new features

## Test Statistics

- **Total Tests**: 260+
- **Test Suites**: 6
- **Coverage Target**: 75%+
- **Average Runtime**: 15-20s

## Quick Reference

| Command | Purpose |
|---------|---------|
| `npm run test` | Run all tests once |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:ui` | Open test UI in browser |
| `npm run test:coverage` | Generate coverage report |
| `npm run test -- -t "pattern"` | Run specific test |
| `npm run test -- --reporter=verbose` | Verbose output |

## Support

- 📖 [Vitest Documentation](https://vitest.dev/)
- 🧪 [React Testing Library](https://testing-library.com/react)
- 💬 Check test file comments for specific patterns

---

Happy testing! 🚀

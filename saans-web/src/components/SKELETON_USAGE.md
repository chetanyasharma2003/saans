# Loading Skeletons & Empty States Usage Guide

This guide explains how to use the `LoadingSkeleton.tsx` and `EmptyState.tsx` components throughout the SAANS platform.

## Overview

### LoadingSkeleton.tsx
Professional loading placeholder components that display while data is being fetched.

**Available Skeletons:**
- `ListSkeleton` - For lists of items (appointments, messages, mood entries)
- `CardSkeleton` - For grid/card layouts (therapist profiles, community posts)
- `ProfileSkeleton` - For profile cards and user information
- `ChatSkeleton` - For chat conversations and messaging interfaces
- `SkeletonLoader` - Wrapper component for all skeleton types

### EmptyState.tsx
Friendly empty state components that guide users when there's no data to display.

**Available Empty States:**
- `NoAppointmentsEmptyState` - When no appointments are scheduled
- `NoMessagesEmptyState` - When no messages or conversations exist
- `NoMoodEntriesEmptyState` - When no mood tracking entries exist
- `NoCommunityPostsEmptyState` - When community section is empty
- `EmptySearchState` - When search returns no results
- `ErrorState` - When an error occurs during data loading
- `SuccessState` - When an action completes successfully

---

## Usage Examples

### 1. List Skeleton (Appointments Page)

```tsx
import { ListSkeleton, NoAppointmentsEmptyState } from '../components/LoadingSkeleton';
import { EmptyState } from '../components/EmptyState';

function AppointmentsPage() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments().then((data) => {
      setAppointments(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <ListSkeleton count={3} />;
  }

  if (appointments.length === 0) {
    return (
      <NoAppointmentsEmptyState
        onScheduleClick={() => navigate('/schedule')}
        onFindTherapistClick={() => navigate('/therapist')}
      />
    );
  }

  return (
    <div className="space-y-3">
      {appointments.map((apt) => (
        <AppointmentCard key={apt.id} appointment={apt} />
      ))}
    </div>
  );
}
```

### 2. Card Skeleton (Therapist Directory)

```tsx
import { CardSkeleton, NoCommunityPostsEmptyState } from '../components/LoadingSkeleton';

function TherapistDirectory() {
  const [therapists, setTherapists] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTherapists().then((data) => {
      setTherapists(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <CardSkeleton count={4} hasBadge={true} />;
  }

  if (therapists.length === 0) {
    return (
      <EmptyState
        icon={<Users size={24} />}
        title="No Therapists Available"
        description="No therapists match your criteria. Try adjusting your filters."
        actionLabel="Reset Filters"
        onActionClick={handleResetFilters}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {therapists.map((therapist) => (
        <TherapistCard key={therapist.id} therapist={therapist} />
      ))}
    </div>
  );
}
```

### 3. Profile Skeleton (User Profile)

```tsx
import { ProfileSkeleton } from '../components/LoadingSkeleton';

function UserProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile().then((data) => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <ProfileSkeleton />;
  }

  return (
    <ProfileCard profile={profile} />
  );
}
```

### 4. Chat Skeleton (Chat Interface)

```tsx
import { ChatSkeleton } from '../components/LoadingSkeleton';

function ChatPage() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMessages().then((data) => {
      setMessages(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <ChatSkeleton messageCount={5} />;
  }

  return (
    <ChatWindow messages={messages} />
  );
}
```

### 5. Mood Tracker with Empty State

```tsx
import { ListSkeleton, NoMoodEntriesEmptyState } from '../components/LoadingSkeleton';

function MoodTrackerPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMoodEntries().then((data) => {
      setEntries(data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <ListSkeleton count={4} isCompact={false} />;
  }

  if (entries.length === 0) {
    return (
      <NoMoodEntriesEmptyState
        onTrackMoodClick={() => navigate('/track-mood')}
        onViewGuideClick={() => showGuide()}
      />
    );
  }

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <MoodEntryCard key={entry.id} entry={entry} />
      ))}
    </div>
  );
}
```

### 6. Search Results with Empty State

```tsx
import { ListSkeleton, EmptySearchState } from '../components/LoadingSkeleton';

function SearchResults({ query }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    searchContent(query).then((data) => {
      setResults(data);
      setLoading(false);
    });
  }, [query]);

  if (loading) {
    return <ListSkeleton count={3} isCompact={true} />;
  }

  if (results.length === 0) {
    return (
      <EmptySearchState
        query={query}
        onClearSearch={() => navigate('/dashboard')}
      />
    );
  }

  return (
    <div className="space-y-3">
      {results.map((result) => (
        <SearchResultItem key={result.id} result={result} />
      ))}
    </div>
  );
}
```

### 7. Error Handling

```tsx
import { ListSkeleton, ErrorState } from '../components/LoadingSkeleton';

function DataPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await api.getData();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return <ListSkeleton count={3} />;
  }

  if (error) {
    return (
      <ErrorState
        title="Failed to Load Data"
        description={error}
        onRetryClick={fetchData}
      />
    );
  }

  return (
    <div>
      {data.map((item) => (
        <DataItem key={item.id} item={item} />
      ))}
    </div>
  );
}
```

### 8. Community Posts with Success State

```tsx
import { ListSkeleton, NoCommunityPostsEmptyState, SuccessState } from '../components/LoadingSkeleton';

function CommunityPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [postCreated, setPostCreated] = useState(false);

  useEffect(() => {
    fetchCommunityPosts().then((data) => {
      setPosts(data);
      setLoading(false);
    });
  }, []);

  const handleCreatePost = async (postData) => {
    await api.createPost(postData);
    setPostCreated(true);
    setTimeout(() => setPostCreated(false), 3000);
  };

  if (postCreated) {
    return (
      <SuccessState
        title="Post Created!"
        description="Your post has been shared with the community."
        actionLabel="View Posts"
        onActionClick={() => fetchCommunityPosts()}
      />
    );
  }

  if (loading) {
    return <ListSkeleton count={4} />;
  }

  if (posts.length === 0) {
    return (
      <NoCommunityPostsEmptyState
        onCreatePostClick={() => showPostCreationModal()}
        onExploreClick={() => navigate('/community/discover')}
      />
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <CommunityPost key={post.id} post={post} />
      ))}
    </div>
  );
}
```

---

## Design Guidelines

### Loading Skeletons
- ✅ Use during initial data load
- ✅ Match the layout of the actual content
- ✅ Provide visual feedback that data is loading
- ✅ Maintain consistent animation speed

### Empty States
- ✅ Show meaningful icons (from lucide-react)
- ✅ Provide clear, encouraging messages
- ✅ Include action buttons to guide users
- ✅ Use gradients and backdrop blur for visual hierarchy
- ✅ Match the dark theme of the application

### Best Practices
1. **Always handle three states:** Loading → Error → Empty/Success
2. **Use compact skeletons for lists** and full skeletons for cards
3. **Provide actionable empty states** with clear next steps
4. **Error states should be recoverable** with a retry button
5. **Success states should be temporary** (auto-dismiss after 3 seconds)
6. **Maintain consistency** with the app's teal/cyan color scheme

---

## Customization

### Create a Custom Empty State

```tsx
import { EmptyState } from '../components/EmptyState';
import { Star } from 'lucide-react';

function CustomEmptyState() {
  return (
    <EmptyState
      icon={<Star size={24} />}
      title="No Favorites"
      description="You haven't marked anything as a favorite yet."
      actionLabel="Add Favorite"
      onActionClick={() => console.log('Add favorite')}
      actionLabel2="Browse Items"
      onActionClick2={() => navigate('/browse')}
    />
  );
}
```

### Adjust Skeleton Count

```tsx
// Show 5 list items instead of 3
<ListSkeleton count={5} />

// Show 2 cards
<CardSkeleton count={2} />

// Show 8 chat messages
<ChatSkeleton messageCount={8} />
```

---

## Color Scheme

Both components follow the SAANS color palette:
- **Background:** `slate-800`, `slate-900`
- **Accent:** `teal-600`, `cyan-600` (primary actions)
- **Error:** `red-600` (error states)
- **Success:** `green-600` (success states)
- **Warning:** `yellow-500` (search/info states)
- **Text:** `white` (primary), `slate-400` (secondary)

---

## Accessibility

- ✅ Proper contrast ratios for text
- ✅ Meaningful alt text for icons
- ✅ Clear button labels
- ✅ Keyboard navigable action buttons
- ✅ ARIA labels on loading states

---

## Performance Tips

1. Use `React.memo()` for list rendering with skeletons
2. Lazy load images in empty states
3. Memoize callback functions to prevent unnecessary re-renders
4. Use `useCallback()` for action handlers

```tsx
const handleScheduleClick = useCallback(() => {
  navigate('/schedule');
}, [navigate]);

return (
  <NoAppointmentsEmptyState 
    onScheduleClick={handleScheduleClick}
  />
);
```

---

## File Locations

- Skeletons: `/src/components/LoadingSkeleton.tsx`
- Empty States: `/src/components/EmptyState.tsx`
- Imports: `import { ListSkeleton, CardSkeleton, ... } from '../components/LoadingSkeleton'`


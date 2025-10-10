import { useLocalSearchParams } from 'expo-router';
import SearchResultsScreen from '@/screens/SearchResultsScreen';

export default function SearchResultsPage() {
  const params = useLocalSearchParams();
  
  // Parse the search parameters
  const initialResults = params.initialResults ? JSON.parse(params.initialResults as string) : null;
  const searchQuery = params.searchQuery as string;
  const searchParams = params.searchParams as string;
  
  return (
    <SearchResultsScreen 
      initialResults={initialResults}
      searchQuery={searchQuery}
      searchParams={searchParams}
    />
  );
}
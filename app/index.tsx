import GitHubRepos from '@/app/GithubRepo';
import ReactQuerySetup from '@/app/ReactQuerySetup';

export default function Index() {
  return (
    <ReactQuerySetup>
      <GitHubRepos />
    </ReactQuerySetup>
  );
}

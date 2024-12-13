import GitHubRepos from "@/app/GithubRepo";
import { SafeAreaView } from "react-native-safe-area-context";
import ReactQuerySetup from "@/app/ReactQuerySetup";

export default function Index() {
    return (
        <ReactQuerySetup>
            <GitHubRepos/>
        </ReactQuerySetup>
    );
}

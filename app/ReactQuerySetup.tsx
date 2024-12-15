import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

interface Props {
    children: React.ReactNode;
}


const ReactQuerySetup: React.FC<Props> = ({ children }) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: Infinity,
            },
        },
    });
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
};

export default ReactQuerySetup;

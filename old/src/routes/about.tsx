import {
    useSubmission,
    type RouteSectionProps
} from "@solidjs/router";

export default function About(props: RouteSectionProps) {
    return <main>
        <div>Hello About Page 2</div>
        <div>Env Test: {import.meta.env.VITE_TEST}</div>
    </main>
}
// /// <reference types="vinxi/types/client" />
// import { MetaProvider } from "@solidjs/meta";
// import { createAssets } from "@vinxi/solid";
// import { NoHydration, Suspense, hydrate } from "solid-js/web";
// import { getManifest } from "vinxi/manifest";

// // const Assets = createAssets(
    // // 	getManifest("client").handler,
    // // 	getManifest("client"),
    // // );
    
    // hydrate(
        // 	() => (
            // 		<MetaProvider>
            // 			{/* <App
            // 				assets={
                // 					<>
                // 						<NoHydration></NoHydration>
                // 						<Suspense>
                // 							<Assets />
                // 						</Suspense>
                // 					</>
                // 				}
                // 				scripts={
                    // 					<>
                    // 						<NoHydration></NoHydration>
// 					</>
// 				}
// 			/> */}
// 		</MetaProvider>
// 	),
// 	document,
// );

/// <reference types="vinxi/types/client" />
import { render } from "solid-js/web";
import "vinxi/client";

import Logo from "./logo.png";
import "./style.css";

render(
	() => (
		<div>
			Hello World 2
			<img src={Logo} />
		</div>
	),
	document.getElementById("root")!,
);

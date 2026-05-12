import { EdgeType, type GrafikaSettings } from "grafika"
import { welcome_data } from "../welcome/welcomeData"

export type GrafikaInitType =
    'main' |
    'welcome' |
    'chat' |
    'build'

export const GRAFIKA_INITIALIZERS: Record<GrafikaInitType, GrafikaSettings> = {
    main: {
        graphics: {
            antialiasing: false,
            backgroundColor: '#020202',
            initialZoom: 1 / 100,
            defaultEdgeColor: "source",
            defaultEdgeAlpha: 0.6,
            colorfulText: true,
            defaultEdgeType: EdgeType.Tapered,
            backdrop: {
                startAppearingAt: 0.001,
                fullyVisibleAt: 0.1,
                parallax: 0.75,
                scale: 5,
                url: "backdrop.png"
            }
        },
        simulation: { pushThreshold: 1000 },
        debug: { showFps: true },
        data: {}
    },
    welcome: {
        graphics: {
            antialiasing: true,
            backgroundColor: '#020202',
            initialZoom: 1 / 10,
            floatingNodes: true,
            defaultEdgeColor: "source",
            defaultEdgeAlpha: 0.6,
            colorfulText: true,
            defaultEdgeType: EdgeType.Tapered,
            backdrop: {
                startAppearingAt: 0.001,
                fullyVisibleAt: 0.1,
                parallax: 0.75,
                scale: 5,
                url: "backdrop.png"
            }
        },
        simulation: { pushThreshold: 2000 },
        debug: { showFps: true },
        data: {
            nodes: [{
                ...welcome_data.nodes.find(n => n.id === "hello_explorer")!,
                hollowEffect: true, blinkEffect: true, radius: 80
            }],
            edges: welcome_data.edges
        }
    },
    chat: {
        graphics: {
            antialiasing: true,
            backgroundColor: '#020202',
            initialZoom: 1 / 20,
            defaultEdgeColor: "source",
            defaultEdgeAlpha: 0.6,
            colorfulText: true,
            defaultEdgeType: EdgeType.Tapered,
            backdrop: {
                startAppearingAt: 0.001,
                fullyVisibleAt: 0.1,
                parallax: 0.75,
                scale: 5,
                url: "backdrop.png"
            }
        },
        simulation: { pushThreshold: 500, defaultEdgeLength: 10, downflowEnabled: true },
        debug: { showFps: true },
        data: {}
    },
    build: {}
}
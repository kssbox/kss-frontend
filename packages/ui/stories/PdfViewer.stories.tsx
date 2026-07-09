import type { Meta, StoryObj } from '@storybook/react'
import { PdfViewer } from '../src/components/pdf-viewer/PdfViewer'
import { useState } from 'react'

// Public sample PDF for testing
const SAMPLE_PDF =
    "http://localhost:29000/vlm-files/821614677174865920/821614692165312512.pdf?X-Amz-Algorithm=AWS4-HMAC-SHA256%5Cu0026X-Amz-Credential=minioadmin%252F20260317%252Fus-east-1%252Fs3%252Faws4_request%5Cu0026X-Amz-Date=20260317T090911Z%5Cu0026X-Amz-Expires=3600%5Cu0026X-Amz-SignedHeaders=host%5Cu0026X-Amz-Signature=4ff60c2844bdff228720f25ee4c1f0a2f3687264ce926a3573b55e7eff80a1f8"
// https://mozilla.github.io/pdf.js/web/compressed.tracemonkey-pldi-09.pdf
// new URL('../.storybook/assets/chinese.pdf', import.meta.url).href
// "http://localhost:29000/vlm-files/809423573155401728/en.pdf"
// "http://localhost:29000/vlm-files/809423573155401728/compressed.tracemonkey-pldi-09.pdf"


const meta: Meta<typeof PdfViewer> = {
    title: 'Components/PdfViewer',
    component: PdfViewer,
    parameters: {
        layout: 'fullscreen',
    },
    tags: ['autodocs'],
    argTypes: {
        url: { control: 'text' },
        initialPage: { control: { type: 'number', min: 1 } },
        features: { control: 'object' },
    },
    decorators: [
        (Story) => (
            <div style={{ width: '100vw', height: '100vh' }}>
                <Story />
            </div>
        ),
    ],
} satisfies Meta<typeof PdfViewer>

export default meta
type Story = StoryObj<typeof meta>

/** Default view with standard features (pagination, zoom, pageJump, textSelection) */
export const Default: Story = {
    args: {
        url: SAMPLE_PDF,
    },
}

/** All features enabled: search, thumbnails, pagination, zoom, pageJump, textSelection */
export const AllFeatures: Story = {
    args: {
        url: SAMPLE_PDF,
        features: {
            pagination: true,
            zoom: true,
            pageJump: true,
            textSelection: true,
            search: true,
            thumbnails: true,
        },
    },
}

/** Minimal view: only the PDF pages, no toolbar controls */
export const Minimal: Story = {
    args: {
        url: SAMPLE_PDF,
        features: {
            pagination: false,
            zoom: false,
            pageJump: false,
            textSelection: false,
            search: false,
            thumbnails: false,
        },
    },
}

/** Start at a specific page (page 3) */
export const StartAtPage3: Story = {
    args: {
        url: SAMPLE_PDF,
        initialPage: 3,
    },
}

/** With search enabled */
export const WithSearch: Story = {
    args: {
        url: SAMPLE_PDF,
        features: {
            pagination: true,
            zoom: true,
            pageJump: true,
            textSelection: true,
            search: true,
            thumbnails: false,
        },
    },
}

/** With thumbnail sidebar enabled */
export const WithThumbnails: Story = {
    args: {
        url: SAMPLE_PDF,
        features: {
            pagination: true,
            zoom: true,
            pageJump: true,
            textSelection: true,
            search: false,
            thumbnails: true,
        },
    },
}

/** With close button callback */
export const WithCloseButton: Story = {
    args: {
        url: SAMPLE_PDF,
        onClose: () => alert('Close clicked!'),
    },
}

/** Error state: invalid URL to show error handling */
export const ErrorState: Story = {
    args: {
        url: 'https://invalid.example.com/nonexistent.pdf',
    },
}

/** Interactive demo: toggle features dynamically */
export const InteractiveDemo: Story = {
    args: {
        url: SAMPLE_PDF,
    },
    render: function InteractiveDemoRender() {
        const [features, setFeatures] = useState({
            pagination: true,
            zoom: true,
            pageJump: true,
            textSelection: true,
            search: false,
            thumbnails: false,
        })
        const [loadInfo, setLoadInfo] = useState<string>('')

        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
                <div
                    style={{
                        display: 'flex',
                        gap: 12,
                        padding: '8px 16px',
                        background: '#f0f0f0',
                        borderBottom: '1px solid #ddd',
                        flexWrap: 'wrap',
                        alignItems: 'center',
                    }}
                >
                    {(Object.keys(features) as Array<keyof typeof features>).map((key) => (
                        <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 13 }}>
                            <input
                                type="checkbox"
                                checked={features[key]}
                                onChange={() => setFeatures((f) => ({ ...f, [key]: !f[key] }))}
                            />
                            {key}
                        </label>
                    ))}
                    {loadInfo && (
                        <span style={{ fontSize: 12, color: '#888', marginLeft: 'auto' }}>{loadInfo}</span>
                    )}
                </div>
                <div style={{ flex: 1, minHeight: 0 }}>
                    <PdfViewer
                        url={SAMPLE_PDF}
                        features={features}
                        onLoadSuccess={({ numPages }) => setLoadInfo(`Loaded: ${numPages} pages`)}
                        onLoadError={(err) => setLoadInfo(`Error: ${err.message}`)}
                    />
                </div>
            </div>
        )
    },
}

import { NextRequest, NextResponse } from 'next/server';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_OWNER = 'adhilansari';
const GITHUB_REPO = 'hadithDb';
const GITHUB_BRANCH = 'main';

interface UpdateTranslationRequest {
    book: string;
    language: string;
    hadithNumber: number;
    text: string;
}

export async function POST(request: NextRequest) {
    try {
        if (!GITHUB_TOKEN) {
            console.error('GitHub token not configured');
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        const body: UpdateTranslationRequest = await request.json();
        const { book, language, hadithNumber, text } = body;

        if (!book || !language || !hadithNumber || !text) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            );
        }

        const filePath = language === 'ara'
            ? `data/ara-${book}.min.json`
            : `translations/${language}-${book}.min.json`;

        // Get current file
        const getFileUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${filePath}`;
        const getResponse = await fetch(getFileUrl, {
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
            },
        });

        if (!getResponse.ok) {
            throw new Error(`Failed to fetch file: ${getResponse.statusText}`);
        }

        const fileData = await getResponse.json();
        const content = Buffer.from(fileData.content, 'base64').toString('utf-8');
        const jsonData = JSON.parse(content);

        // Update hadith
        const hadithIndex = jsonData.hadiths.findIndex(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (h: any) => h.hadithnumber === hadithNumber
        );

        if (hadithIndex === -1) {
            return NextResponse.json(
                { error: 'Hadith not found' },
                { status: 404 }
            );
        }

        jsonData.hadiths[hadithIndex].text = text;

        // Commit update
        const updatedContent = Buffer.from(JSON.stringify(jsonData, null, 2)).toString('base64');

        const updateResponse = await fetch(getFileUrl, {
            method: 'PUT',
            headers: {
                'Authorization': `token ${GITHUB_TOKEN}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: `Update ${language} translation for ${book} hadith #${hadithNumber}`,
                content: updatedContent,
                sha: fileData.sha,
                branch: GITHUB_BRANCH,
            }),
        });

        if (!updateResponse.ok) {
            const errorData = await updateResponse.json();
            throw new Error(`Failed to update file: ${JSON.stringify(errorData)}`);
        }

        const result = await updateResponse.json();

        return NextResponse.json({
            success: true,
            message: 'Translation updated successfully',
            commit: result.commit.sha,
        });

    } catch (error) {
        console.error('Update translation error:', error);
        return NextResponse.json(
            {
                error: 'Failed to update translation',
                details: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({
        status: 'API endpoint active',
        githubConfigured: !!GITHUB_TOKEN,
    });
}
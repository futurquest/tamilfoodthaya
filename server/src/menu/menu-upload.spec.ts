import { hasImageSignature, imageStorageMode, uploadedImageUrl } from './menu.controller';
import { del, put } from '@vercel/blob';

jest.mock('@vercel/blob', () => ({ put: jest.fn(), del: jest.fn() }));

describe('menu upload signatures', () => {
    it('accepts supported image headers', () => {
        expect(hasImageSignature('image/jpeg', Buffer.from([0xff, 0xd8, 0xff]))).toBe(true);
        expect(hasImageSignature('image/png', Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(true);
        expect(hasImageSignature('image/webp', Buffer.from('RIFF0000WEBP'))).toBe(true);
    });

    it('rejects HTML disguised as an image', () => {
        expect(hasImageSignature('image/jpeg', Buffer.from('<script>alert(1)</script>'))).toBe(false);
        expect(hasImageSignature('image/png', Buffer.from('<html>'))).toBe(false);
    });

    it('requires persistent storage on Vercel while retaining local storage elsewhere', () => {
        expect(imageStorageMode({})).toBe('local');
        expect(imageStorageMode({ VERCEL: '1' })).toBe('blob');
        expect(() => imageStorageMode({ VERCEL: '1', UPLOAD_STORAGE: 'local' })).toThrow();
    });

    it('uploads valid images to Blob and cleans up using the returned URL', async () => {
        const previousVercel = process.env.VERCEL;
        process.env.VERCEL = '1';
        (put as jest.Mock).mockResolvedValue({ url: 'https://example.public.blob.vercel-storage.com/menu/test.jpg' });
        (del as jest.Mock).mockResolvedValue(undefined);
        try {
            const file = { mimetype: 'image/jpeg', buffer: Buffer.from([0xff, 0xd8, 0xff]) } as Express.Multer.File;
            const uploaded = await uploadedImageUrl(file, {});
            expect(put).toHaveBeenCalledWith(expect.stringMatching(/^menu\/[a-f0-9]{32}\.jpg$/), file.buffer,
                expect.objectContaining({ access: 'public', contentType: 'image/jpeg' }));
            expect(uploaded.url).toBe('https://example.public.blob.vercel-storage.com/menu/test.jpg');
            await uploaded.cleanup();
            expect(del).toHaveBeenCalledWith(uploaded.url);
        } finally {
            if (previousVercel === undefined) delete process.env.VERCEL;
            else process.env.VERCEL = previousVercel;
        }
    });
});

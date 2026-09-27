import { hasImageSignature } from './menu.controller';

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
});

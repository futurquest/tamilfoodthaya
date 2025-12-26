export const SEO = ({ title, description, schema }: { title: string; description: string; schema?: any }) => (
    <>
        <title>{title} | Tamil Food Thaya</title>
        <meta name="description" content={description} />
        <meta property="og:title" content={`${title} | Tamil Food Thaya`} />
        <meta property="og:description" content={description} />
        <meta property="og:type" content="website" />
        {schema && (
            <script type="application/ld+json">
                {JSON.stringify(schema)}
            </script>
        )}
    </>
);

export const restaurantSchema = {
    "@context": "https://schema.org",
    "@type": "Restaurant",
    "name": "Tamil Food Thaya",
    "image": "https://tamilfoodthaya.nl/logo.png",
    "address": {
        "@type": "PostalAddress",
        "streetAddress": "Hofplein 20",
        "addressLocality": "Rotterdam",
        "postalCode": "3011 CP",
        "addressCountry": "NL"
    },
    "geo": {
        "@type": "GeoCoordinates",
        "latitude": 51.9244,
        "longitude": 4.4777
    },
    "url": "https://tamilfoodthaya.nl",
    "telephone": "+31612345678",
    "servesCuisine": "Tamil, Sri Lankan",
    "priceRange": "$$",
    "openingHoursSpecification": [
        {
            "@type": "OpeningHoursSpecification",
            "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
            "opens": "12:00",
            "closes": "22:00"
        }
    ]
};

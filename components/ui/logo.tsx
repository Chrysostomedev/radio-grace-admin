import Image from "next/image";

interface LogoProps {
    className?: string;
    width: number;
    height: number;
}

export function Logo({ className, width = 150, height = 50 }: LogoProps) {
    // Vous pouvez remplacer ceci par votre propre logo SVG ou image
    return (
        <div className={className}>
            <Image
                src="/img/logo.png"
                alt="Logo"
                width={width}
                height={height}
                className={className}
                priority={true}
            />
        </div>
    );
}

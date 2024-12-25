import Link from "next/link";
import {
  ArrowRight,
  Github,
  Star,
  GitFork,
  Terminal,
  Box,
  Sparkles,
  Code2,
  Blocks,
  Cpu,
  Infinity,
  Puzzle,
  Lightbulb,
  Wand2,
} from "lucide-react";
import { highlight } from "@/lib/shiki";

const CODE_EXAMPLE = `import { Root, Pages, Page, CanvasLayer } from "@unriddle-ai/lector";

function PDFViewer() {
  return (
    <Root fileURL="/document.pdf">
      <Pages>
        <Page>
          <CanvasLayer />
        </Page>
      </Pages>
    </Root>
  );
}`;

const FEATURES = [
  {
    icon: <Blocks className='h-5 w-5' />,
    title: "Composable Architecture",
    description: "Build complex PDF viewers with simple, reusable components",
  },
  {
    icon: <Cpu className='h-5 w-5' />,
    title: "High Performance",
    description: "Optimized rendering with virtual scrolling and lazy loading",
  },
  {
    icon: <Infinity className='h-5 w-5' />,
    title: "Infinite Possibilities",
    description: "Customize every aspect of your PDF viewing experience",
  },
  {
    icon: <Puzzle className='h-5 w-5' />,
    title: "Plugin System",
    description: "Extend functionality with a powerful plugin architecture",
  },
  {
    icon: <Lightbulb className='h-5 w-5' />,
    title: "Smart Features",
    description: "Advanced search, annotations, and document analysis",
  },
  {
    icon: <Wand2 className='h-5 w-5' />,
    title: "Magic Transforms",
    description: "Apply filters, rotations, and transformations with ease",
  },
];

export default async function HomePage() {
  const highlightedCode = await highlight(CODE_EXAMPLE);

  return (
    <div className='relative min-h-screen bg-gradient-to-b from-background to-background/80'>
      {/* Animated Background */}
      <div className='pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_500px_at_50%_200px,rgba(var(--primary-rgb),0.15),transparent)]' />
      </div>

      <div className='relative'>
        {/* Hero Section */}
        <section className='relative overflow-hidden pb-[12rem] pt-[6.5rem]'>
          {/* Glow Effects */}
          <div className='absolute left-1/2 top-0 -translate-x-1/2 transform'>
            <div className='h-[310px] w-[620px] rounded-full bg-primary/10 blur-[120px]' />
          </div>

          <div className='container relative mx-auto px-4'>
            <div className='relative z-10'>
              {/* GitHub Badge */}
              <div className='mx-auto mb-8 flex max-w-fit items-center justify-center space-x-2 overflow-hidden rounded-full border border-foreground/10 bg-background/50 px-7 py-2 shadow-md backdrop-blur transition-all hover:border-foreground/20 hover:bg-background/80'>
                <Star className='h-5 w-5 text-primary' />
                <p className='text-sm font-semibold text-foreground'>Open Source on GitHub</p>
              </div>

              {/* Main Title */}
              <h1 className='animate-fade-up bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-center text-4xl font-bold tracking-[-0.02em] text-transparent opacity-0 animation-delay-200 md:text-7xl md:leading-[5rem]'>
                PDF Viewing{" "}
                <span className='relative whitespace-nowrap'>
                  <svg
                    aria-hidden='true'
                    viewBox='0 0 418 42'
                    className='absolute left-0 top-2/3 h-[0.58em] w-full fill-primary/20'
                    preserveAspectRatio='none'>
                    <path d='M203.371.916c-26.013-2.078-76.686 1.963-124.73 9.946L67.3 12.749C35.421 18.062 18.2 21.766 6.004 25.934 1.244 27.561.828 27.778.874 28.61c.07 1.214.828 1.121 9.595-1.176 9.072-2.377 17.15-3.92 39.246-7.496C123.565 7.986 157.869 4.492 195.942 5.046c7.461.108 19.25 1.696 19.17 2.582-.107 1.183-7.874 4.31-25.75 10.366-21.992 7.45-35.43 12.534-36.701 13.884-2.173 2.308-.202 4.407 4.442 4.734 2.654.187 3.263.157 15.593-.78 35.401-2.686 57.944-3.488 88.365-3.143 46.327.526 75.721 2.23 130.788 7.584 19.787 1.924 20.814 1.98 24.557 1.332l.066-.011c1.201-.203 1.53-1.825.399-2.335-2.911-1.31-4.893-1.604-22.048-3.261-57.509-5.556-87.871-7.36-132.059-7.842-23.239-.254-33.617-.116-50.627.674-11.629.54-42.371 2.494-46.696 2.967-2.359.259 8.133-3.625 26.504-9.81 23.239-7.825 27.934-10.149 28.304-14.005.417-4.348-3.529-6-16.878-7.066Z' />
                  </svg>
                  <span className='relative'>Reimagined</span>
                </span>
              </h1>

              <p className='mx-auto mt-6 max-w-2xl animate-fade-up text-center text-lg text-muted-foreground opacity-0 animation-delay-400'>
                A modern, open-source PDF viewer library that makes document viewing a delightful
                experience. Built with React and TypeScript.
              </p>

              {/* CTA Buttons */}
              <div className='mx-auto mt-8 flex animate-fade-up justify-center space-x-4 opacity-0 animation-delay-600'>
                <Link
                  href='/docs'
                  className='group inline-flex items-center justify-center space-x-2 rounded-full bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30'>
                  <span>Get Started</span>
                  <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
                </Link>
                <Link
                  href='https://github.com/your-repo'
                  className='inline-flex items-center justify-center space-x-2 rounded-full border border-foreground/10 bg-background/50 px-6 py-3 text-sm font-medium backdrop-blur transition-all hover:border-foreground/20 hover:bg-background/80'>
                  <Github className='h-4 w-4' />
                  <span>Star on GitHub</span>
                </Link>
              </div>

              {/* Code Preview */}
              <div className='mx-auto mt-16 max-w-3xl animate-fade-up opacity-0 animation-delay-800'>
                <div className='group relative'>
                  <div className='absolute -inset-px rounded-xl bg-gradient-to-r from-primary/50 to-purple-600/50 opacity-50 blur transition duration-1000 group-hover:opacity-75' />
                  <div className='relative overflow-hidden rounded-xl border border-foreground/10 bg-background/80 shadow-2xl backdrop-blur'>
                    <div className='flex h-12 items-center justify-between border-b border-foreground/10 bg-background/50 px-4'>
                      <div className='flex space-x-2'>
                        <div className='h-3 w-3 rounded-full bg-red-500/70' />
                        <div className='h-3 w-3 rounded-full bg-yellow-500/70' />
                        <div className='h-3 w-3 rounded-full bg-green-500/70' />
                      </div>
                      <div className='flex items-center space-x-2'>
                        <button className='rounded-md p-1.5 hover:bg-foreground/10'>
                          <Terminal className='h-4 w-4 text-muted-foreground' />
                        </button>
                        <button className='rounded-md p-1.5 hover:bg-foreground/10'>
                          <Code2 className='h-4 w-4 text-muted-foreground' />
                        </button>
                      </div>
                    </div>
                    <div
                      className='overflow-x-auto p-4 [&_pre]:!m-0 [&_pre]:!bg-transparent'
                      dangerouslySetInnerHTML={{ __html: highlightedCode }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className='relative z-10 -mt-32 pb-32'>
          <div className='container mx-auto px-4'>
            <div className='relative rounded-[2rem] border border-foreground/10 bg-background/60 p-8 shadow-2xl backdrop-blur-xl md:p-16'>
              <div className='absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_400px,rgba(var(--primary-rgb),0.04),transparent)]' />
              <div className='relative'>
                <div className='mb-12 text-center'>
                  <h2 className='mb-4 bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-3xl font-bold text-transparent md:text-4xl'>
                    Everything you need
                  </h2>
                  <p className='mx-auto max-w-2xl text-muted-foreground'>
                    Built with modern web technologies and designed for developer happiness.
                  </p>
                </div>

                <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
                  {FEATURES.map((feature) => (
                    <div
                      key={feature.title}
                      className='group relative rounded-xl border border-foreground/10 bg-background/50 p-6 shadow-lg transition-all duration-300 hover:border-foreground/20 hover:bg-background/80'>
                      <div className='mb-4 inline-flex rounded-lg bg-primary/10 p-3 text-primary ring-1 ring-primary/20'>
                        {feature.icon}
                      </div>
                      <h3 className='mb-2 text-lg font-semibold'>{feature.title}</h3>
                      <p className='text-muted-foreground'>{feature.description}</p>
                      <div className='absolute right-6 top-6 text-primary opacity-0 transition-opacity duration-300 group-hover:opacity-100'>
                        <Sparkles className='h-4 w-4' />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className='relative z-10 py-16'>
          <div className='container mx-auto px-4'>
            <div className='grid grid-cols-2 gap-8 md:grid-cols-4'>
              <Stat icon={<Star />} value='1.2k+' label='GitHub Stars' />
              <Stat icon={<GitFork />} value='150+' label='Forks' />
              <Stat icon={<Box />} value='100%' label='TypeScript' />
              <Stat value='MIT' label='License' />
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className='relative z-10 py-16'>
          <div className='container mx-auto px-4'>
            <div className='relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-background/60 p-8 text-center backdrop-blur-xl md:p-16'>
              <div className='absolute inset-0 bg-[radial-gradient(circle_800px_at_50%_400px,rgba(var(--primary-rgb),0.08),transparent)]' />
              <div className='relative'>
                <h2 className='mb-4 text-3xl font-bold md:text-4xl'>Ready to get started?</h2>
                <p className='mx-auto mb-8 max-w-2xl text-muted-foreground'>
                  Join the community of developers building amazing PDF experiences.
                </p>
                <Link
                  href='/docs'
                  className='group inline-flex items-center justify-center space-x-2 rounded-full bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30'>
                  <span>View Documentation</span>
                  <ArrowRight className='h-4 w-4 transition-transform duration-300 group-hover:translate-x-1' />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function Stat({ icon, value, label }: { icon?: React.ReactNode; value: string; label: string }) {
  return (
    <div className='group relative rounded-xl border border-foreground/10 bg-background/50 p-6 text-center backdrop-blur-sm transition-all duration-300 hover:border-foreground/20 hover:bg-background/80'>
      <div className='absolute inset-0 bg-gradient-to-br from-primary/5 to-purple-600/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
      <div className='relative'>
        {icon && (
          <div className='mb-2 flex justify-center'>
            <div className='text-primary'>{icon}</div>
          </div>
        )}
        <div className='text-3xl font-bold'>{value}</div>
        <div className='mt-1 text-sm text-muted-foreground'>{label}</div>
      </div>
    </div>
  );
}

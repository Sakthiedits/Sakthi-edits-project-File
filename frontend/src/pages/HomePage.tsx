import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Hero from '@/components/sections/Hero'
import Portfolio from '@/components/sections/Portfolio'
import About from '@/components/sections/About'
import Services from '@/components/sections/Services'
import WhyWorkWithMe from '@/components/sections/WhyWorkWithMe'
import Contact from '@/components/sections/Contact'

export default function HomePage() {
  return (
    <div className="w-full max-w-full overflow-x-hidden bg-[#06050b]">
      <Navbar />
      <main className="w-full max-w-full overflow-x-hidden">
        <Hero />
        <About />
        <Portfolio />
        <Services />
        <WhyWorkWithMe />
        <Contact />
      </main>
      <Footer />
    </div>
  )
}

import Nav              from './components/Nav'
import Hero             from './components/Hero'
import Methodology      from './components/Methodology'
import Findings         from './components/Findings'
import AgePatterns      from './components/AgePatterns'
import LiveDemo         from './components/LiveDemo'
import DimensionTrends  from './components/DimensionTrends'
import WorldMap         from './components/WorldMap'
import CultureModel     from './components/CultureModel'
import Models           from './components/Models'
import Footer           from './components/Footer'
import SectionTransition from './components/SectionTransition'
import './App.css'

export default function App() {
  return (
    <>
      <Nav />
      <main>
        <Hero />
        <SectionTransition
          label="The analytical pipeline"
          sublabel="8 steps from raw constitutional text to predictive model"
        />
        <Methodology />
        <SectionTransition
          label="Key findings"
          sublabel="What the constitutional model reveals"
        />
        <Findings />
        <SectionTransition
          label="Model details"
          sublabel="Feature importance, SHAP analysis, and target comparisons"
        />
        <Models />
        <SectionTransition
          label="Explore the data"
          sublabel="157 countries · 5 democracy targets · constitutional gap"
        />
        <LiveDemo />
        <SectionTransition
          label="How provisions evolved"
          sublabel="14 constitutional dimensions tracked from 1900 to 2023"
        />
        <DimensionTrends />
        <SectionTransition
          label="Explore the atlas"
          sublabel="14 dimensions · 191 countries · 74 years of constitutional history"
        />
        <WorldMap />
        <SectionTransition
          label="Going deeper — age &amp; inflation"
          sublabel="Why older constitutions systematically outperform their text"
        />
        <AgePatterns />
        <SectionTransition
          label="Adding democratic culture"
          sublabel="Step 8 robustness check — does culture explain what text cannot?"
        />
        <CultureModel />
      </main>
      <Footer />
    </>
  )
}

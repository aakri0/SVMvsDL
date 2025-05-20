import './App.css'
import PredictionPanel from './PredictionPanel'

function App() {
  return (
    <div className="App">
      <header style={{ padding: '1rem', backgroundColor: '#282c34', color: 'white' }}>
        <h1>Real-Time Activity Recognition</h1>
      </header>
      <main style={{ padding: '2rem' }}>
        <PredictionPanel />
      </main>
    </div>
  )
}

export default App

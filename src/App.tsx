
import AudioRecorder from 'Components/AudioRecorder';
import { Route, MemoryRouter as Router, Routes } from 'react-router-dom';

function Homepage() {
    return(
        <div>
            <AudioRecorder />
        </div>
    )
}

export default function App() {
    return (
      <Router>
        <Routes>
          <Route path="/" element={<Homepage />} />
        </Routes>
      </Router>
    );
  }

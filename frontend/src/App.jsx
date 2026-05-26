import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/Register/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import BookDetails from './pages/BookDetails/BookDetails';
import Notes from './pages/Notes/Notes';
import Flashcards from './pages/Flashcards/Flashcards';
import Recommendations from './pages/Recommendations/Recommendations';
import Profile from './pages/Profile/Profile';
import RagWorkspace from './pages/RAG/RagWorkspace';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/library" element={<Home />} />
        <Route path="/book/:id" element={<BookDetails />} />
        <Route path="/notes" element={<Notes />} />
        <Route path="/flashcards" element={<Flashcards />} />
        <Route path="/recommendations" element={<Recommendations />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/rag" element={<RagWorkspace />} />
      </Routes>
    </BrowserRouter>
  );
}

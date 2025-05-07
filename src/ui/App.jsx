import './App.css';
import MainLayout from './layouts/MainLayout';
import { Routes, Route } from 'react-router-dom';
import Roles from './pages/Roles';
import ViewRole from './pages/ViewRole';
import Login from './pages/Login';
import Users from './pages/Users';
import Home from './pages/Home';
import Profile from './pages/profile';
import ViewDocument from './pages/ViewDocument';


const NotFound = () => {
  return (<>Page not found 404</>);
};

function App() {
  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route element={<MainLayout />}>
          <Route path='/' element={<Home />} />
          <Route path='/users' element={<Users />} />
          <Route path='/document' element={<ViewDocument />} />
          <Route path='/roles' element={<Roles />} />
          <Route path='/roles/:id' element={<ViewRole />} />
          <Route path='*' element={<NotFound />} />
          <Route path='/profile/:id' element={<Profile />} />
        </Route>
      </Routes>
    </>
  )
}

export default App;
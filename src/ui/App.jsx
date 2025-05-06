import './App.css';
import MainLayout from './layouts/MainLayout';
import DataTable from './components/DataTable';
import { Routes, Route } from 'react-router-dom';
import Roles from './pages/Roles';
import ViewRole from './pages/ViewRole';
import Login from './pages/Login';
import Users from './pages/Users';


const NotFound = () => {
  return (<>Page not found 404</>);
};

function App() {
  return (
    <>
      <Routes>
        <Route path='/login' element={<Login />} />
        <Route element={<MainLayout />}>
          <Route path='/' element={<DataTable />} />
          <Route path='/users' element={<Users />} />
          <Route path='/roles' element={<Roles />} />
          <Route path='/roles/:id' element={<ViewRole />} />
          <Route path='*' element={<NotFound />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
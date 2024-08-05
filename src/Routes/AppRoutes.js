import { Route, Routes } from "react-router-dom";
import CustomerList from "../pages/list/customerList";
import Customer from "../pages/Form/Customer";

const AppRoutes = () => {
  return (
    <div>
      <Routes>
        <Route path="/" element={<CustomerList />} />
        <Route path="/customer-form/:index?" element={<Customer />} />
        <Route path="/customer-form" element={<Customer />} />
      </Routes>
    </div>
  );
};
export default AppRoutes;

import React, { useState, useEffect } from 'react';
import { Form, Button, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { savePaymentMethod } from '../slices/cartSlice';
import { useNavigate } from 'react-router-dom';
import { useCreateOrderMutation } from '../slices/ordersApiSlice';
import { clearCartItems } from '../slices/cartSlice';
import { toast } from 'react-toastify';
import FormContainer from '../components/FormContainer';
import CheckoutSteps from '../components/CheckoutSteps';
import Meta from '../components/Meta';

const Payment = () => {
  const [paymentMethod, setPaymentMethod] = useState('Razorpay');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { shippingAddress, cartItems, itemsPrice, taxPrice, shippingPrice, totalPrice } = useSelector(
    state => state.cart
  );

  const [createOrder, { isLoading }] = useCreateOrderMutation();

  useEffect(() => {
    if (!shippingAddress) {
      navigate('/shipping');
    }
  }, [shippingAddress, navigate]);

  const submitHandler = async (e) => {
    e.preventDefault();
    if (paymentMethod === 'COD') {
      // Automatically place the order for COD
      try {
        const res = await createOrder({
          cartItems,
          shippingAddress,
          paymentMethod: 'COD', // Specify COD as the payment method
          itemsPrice,
          taxPrice,
          shippingPrice,
          totalPrice,
        }).unwrap();
        dispatch(clearCartItems());
        navigate(`/order/${res._id}`); // Redirect to order details page
      } catch (error) {
        toast.error(error?.data?.message || error.error);
      }
    } else {
      // Save the selected payment method and navigate to Place Order page
      dispatch(savePaymentMethod(paymentMethod));
      navigate('/place-order');
    }
  };

  return (
    <FormContainer>
      <CheckoutSteps step1 step2 step3 />
      <Meta title={'Payment Method'} />
      <h1>Payment Method</h1>
      <Form onSubmit={submitHandler}>
        <Form.Group>
          <Form.Label as="legend">Select Method</Form.Label>
          <Col>
            <Form.Check
              className="my-2"
              type="radio"
              id="Razorpay"
              label="Razorpay"
              name="paymentMethod"
              value="Razorpay"
              checked={paymentMethod === 'Razorpay'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            ></Form.Check>
            <Form.Check
              className="my-2"
              type="radio"
              id="COD"
              label="Cash on Delivery (COD)"
              name="paymentMethod"
              value="COD"
              checked={paymentMethod === 'COD'}
              onChange={(e) => setPaymentMethod(e.target.value)}
            ></Form.Check>
          </Col>
        </Form.Group>
        <Button className="mb-3 w-100" variant="warning" type="submit" disabled={isLoading}>
          {paymentMethod === 'COD' ? 'Place Order' : 'Continue'}
        </Button>
      </Form>
    </FormContainer>
  );
};

export default Payment;

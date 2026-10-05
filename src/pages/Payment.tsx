import API_BASE_URL from "../config/api";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles.css";

declare global {
  interface Window {
    Razorpay: any;
  }
}

interface BookingResponse {
  id: number;
  bookingId: string;
  userEmail: string;
  movieId: number;
  theatreId: number;
  screenId: number;
  showTime: string;
  ticketPrice: number;
  convenienceFee: number;
  totalAmount: number;
  status: string;
  bookingTime: string;
}

interface PaymentResponse {
  paymentId: string;
  bookingId: string;
  gatewayOrderId: string;
  gatewayPaymentId?: string;
  status: string;
}

export default function Payment() {
  const navigate = useNavigate();
  const location = useLocation();

  const [method, setMethod] = useState("upi");
  const [upi, setUpi] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");

  const [errors, setErrors] = useState({
    upi: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    bank: ""
  });

  const [processing, setProcessing] = useState(false);

  const seats = location.state?.selectedSeats || [];
  const selectedSeatIds = location.state?.selectedSeatIds || [];

  const pricePerSeat = location.state?.pricePerSeat || 250;

  const movieTitle = location.state?.movieTitle || "Inception";
  const movieId = Number(location.state?.movieId || location.state?.id || 1);

  const showtime = location.state?.showtime || "6:45 PM";

  const showDate =
  location.state?.showDate ||
  new Date().toISOString().split("T")[0];

  const theatre = location.state?.theatre || "Galaxy Cinema";
  const theatreId = Number(location.state?.theatreId || 1);

  const screen = location.state?.screen || "Screen 2";
  const screenId = Number(location.state?.screenId || 2);

  const ticketPrice = seats.length * pricePerSeat;
  const convenienceFee = ticketPrice * 0.1;
  const total = ticketPrice + convenienceFee;

  const getUserEmail = () => {
    const currentUser = localStorage.getItem("iCinemaCurrentUser");

    if (!currentUser) {
      return "";
    }

    try {
      const user = JSON.parse(currentUser);
      return user.email || "";
    } catch {
      return "";
    }
  };

  const createShowTime = () => {
  const match = showtime.match(
    /(\d{1,2}):(\d{2})\s*(AM|PM)/i
  );

  if (!match || !showDate) {
    return "";
  }

  let hours = Number(match[1]);
  const minutes = Number(match[2]);
  const period = match[3].toUpperCase();

  if (period === "PM" && hours !== 12) {
    hours += 12;
  }

  if (period === "AM" && hours === 12) {
    hours = 0;
  }

  const hour = String(hours).padStart(2, "0");
  const minute = String(minutes).padStart(2, "0");

  return `${showDate}T${hour}:${minute}:00`;
};

  const validatePayment = () => {
    const newErrors = {
      upi: "",
      cardNumber: "",
      expiry: "",
      cvv: "",
      bank: ""
    };

    if (method === "upi") {
      const upiRegex = /^[\w.-]+@[\w.-]+$/;

      if (!upi.trim()) {
        newErrors.upi = "Please enter your UPI ID.";
      } else if (!upiRegex.test(upi.trim())) {
        newErrors.upi = "Please enter a valid UPI ID.";
      }
    }

    if (method === "card") {
      const cleanCardNumber = cardNumber.replace(/\s/g, "");

      if (!cleanCardNumber) {
        newErrors.cardNumber = "Please enter your card number.";
      } else if (!/^\d{16}$/.test(cleanCardNumber)) {
        newErrors.cardNumber = "Card number must contain 16 digits.";
      }

      if (!expiry) {
        newErrors.expiry = "Please enter the expiry date.";
      } else if (!/^\d{2}\s?\/\s?\d{2}$/.test(expiry)) {
        newErrors.expiry = "Enter expiry in MM / YY format.";
      }

      if (!cvv) {
        newErrors.cvv = "Please enter your CVV.";
      } else if (!/^\d{3}$/.test(cvv)) {
        newErrors.cvv = "CVV must contain 3 digits.";
      }
    }

    if (method === "netbanking") {
      const bankSelect = document.querySelector(
        ".payment-input-area select"
      ) as HTMLSelectElement;

      if (!bankSelect || bankSelect.value === "Select bank") {
        newErrors.bank = "Please select your bank.";
      }
    }

    setErrors(newErrors);

    return !Object.values(newErrors).some(
      (error) => error !== ""
    );
  };

  const handlePayment = async () => {
    if (!validatePayment()) {
      return;
    }

    const userEmail = getUserEmail();

    if (!userEmail) {
      alert("Please sign in before making a payment.");
      navigate("/signin");
      return;
    }

    if (!selectedSeatIds.length) {
      alert("No seats selected.");
      return;
    }

    try {
      setProcessing(true);

      const bookingResponse = await fetch(
        API_BASE_URL + "/api/bookings",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            userEmail,
            movieId,
            theatreId,
            screenId,
            showTime: createShowTime(),
            ticketPrice,
            convenienceFee,
            totalAmount: total,
            seatIds: selectedSeatIds
          })
        }
      );

      if (!bookingResponse.ok) {
        const errorMessage = await bookingResponse.text();

        throw new Error(
          errorMessage || "Unable to create booking"
        );
      }

      const booking: BookingResponse =
        await bookingResponse.json();

      if (!booking.bookingId) {
        throw new Error(
          "Booking ID was not returned by Booking Service."
        );
      }

      if (booking.status !== "PENDING_PAYMENT") {
        throw new Error(
          `Unexpected booking status: ${booking.status}`
        );
      }

      const paymentOrderResponse = await fetch(
        API_BASE_URL + "/api/payments/create-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            bookingId: booking.bookingId,
            userEmail,
            amount: total,
            currency: "INR"
          })
        }
      );

      if (!paymentOrderResponse.ok) {
        const errorMessage =
          await paymentOrderResponse.text();

        throw new Error(
          errorMessage ||
            "Unable to create payment order"
        );
      }

      const payment: PaymentResponse =
        await paymentOrderResponse.json();

      if (!payment.gatewayOrderId) {
        throw new Error(
          "Razorpay order ID was not returned."
        );
      }

      if (!window.Razorpay) {
        throw new Error(
          "Razorpay Checkout failed to load. Please refresh the page."
        );
      }

      const options = {
        key: "rzp_test_Tf1nfVPpAaFvX6",
        amount: Math.round(total * 100),
        currency: "INR",
        name: "I-Cinema",
        description: `${movieTitle} - ${seats.join(", ")}`,
        order_id: payment.gatewayOrderId,

        prefill: {
          name: "I-Cinema User",
          email: userEmail,
          contact: "9876543210"
        },

        config: {
          display: {
            blocks: {
              payment_methods: {
                name: "Pay using",
                instruments: [
                  {
                    method: "upi"
                  },
                  {
                    method: "card"
                  },
                  {
                    method: "netbanking"
                  },
                  {
                    method: "wallet"
                  }
                ]
              }
            },
            sequence: [
              "block.payment_methods"
            ],
            preferences: {
              show_default_blocks: true
            }
          }
        },

        handler: async function (response: any) {
          try {
            const verifyResponse = await fetch(
              API_BASE_URL + "/api/payments/verify",
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify({
                  razorpayOrderId:
                    response.razorpay_order_id,
                  razorpayPaymentId:
                    response.razorpay_payment_id,
                  razorpaySignature:
                    response.razorpay_signature
                })
              }
            );

            if (!verifyResponse.ok) {
              const errorMessage =
                await verifyResponse.text();

              throw new Error(
                errorMessage ||
                  "Payment verification failed."
              );
            }

            const verifiedPayment: PaymentResponse =
              await verifyResponse.json();

            const confirmBookingResponse =
              await fetch(
                `${API_BASE_URL}/api/bookings/${booking.id}/status`,
                {
                  method: "PUT",
                  headers: {
                    "Content-Type": "application/json"
                  },
                  body: JSON.stringify({
                    status: "CONFIRMED"
                  })
                }
              );

            if (!confirmBookingResponse.ok) {
              const errorMessage =
                await confirmBookingResponse.text();

              throw new Error(
                errorMessage ||
                  "Payment succeeded but booking confirmation failed."
              );
            }

            const confirmedBooking: BookingResponse =
              await confirmBookingResponse.json();

            navigate("/confirmation", {
              state: {
                seats,
                ticketPrice,
                convenienceFee,
                total,
                movieTitle,
                showtime,
                showDate,
                theatre,
                screen,
                paymentId:
                  verifiedPayment.paymentId,
                gatewayPaymentId:
                  verifiedPayment.gatewayPaymentId,
                bookingId:
                  confirmedBooking.bookingId
              }
            });
          } catch (error) {
            console.error(
              "Payment verification error:",
              error
            );

            alert(
              error instanceof Error
                ? error.message
                : "Payment verification failed."
            );
          } finally {
            setProcessing(false);
          }
        },

        modal: {
          ondismiss: function () {
            console.log(
              "Razorpay Checkout closed"
            );

            setProcessing(false);
          }
        },

        theme: {
          color: "#b64b2a"
        }
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        function (response: any) {
          console.error(
            "Payment failed:",
            response.error
          );

          setProcessing(false);

          alert(
            "Payment failed. Please try again."
          );
        }
      );

      razorpay.open();
    } catch (error) {
      console.error(
        "Payment error:",
        error
      );

      setProcessing(false);

      alert(
        error instanceof Error
          ? error.message
          : "Unable to start payment. Please try again."
      );
    }
  };

  return (
    <div className="payment-page">

      <header className="payment-header">

        <button
          className="back-button"
          onClick={() => navigate(-1)}
        >
          ← Back to seats
        </button>

        <div className="payment-heading">
          <span>I-CINEMA</span>
          <h1>Complete your booking.</h1>
        </div>

      </header>

      <main className="payment-content">

        <section className="payment-form">

          <p className="section-label">
            PAYMENT METHOD
          </p>

          <div className="payment-methods">

            <button
              className={
                method === "upi"
                  ? "method active"
                  : "method"
              }
              onClick={() => setMethod("upi")}
            >
              <strong>UPI</strong>
              <span>Pay using UPI</span>
            </button>

            <button
              className={
                method === "card"
                  ? "method active"
                  : "method"
              }
              onClick={() => setMethod("card")}
            >
              <strong>Card</strong>
              <span>Credit or debit card</span>
            </button>

            <button
              className={
                method === "netbanking"
                  ? "method active"
                  : "method"
              }
              onClick={() =>
                setMethod("netbanking")
              }
            >
              <strong>Net Banking</strong>
              <span>Pay through your bank</span>
            </button>

          </div>

          {method === "upi" && (
            <div className="payment-input-area">

              <label>UPI ID</label>

              <input
                type="text"
                placeholder="yourname@upi"
                value={upi}
                onChange={(e) => {
                  setUpi(e.target.value);

                  setErrors({
                    ...errors,
                    upi: ""
                  });
                }}
              />

              {errors.upi && (
                <p className="input-error">
                  {errors.upi}
                </p>
              )}

              <p className="input-help">
                Enter your UPI ID to continue.
              </p>

            </div>
          )}

          {method === "card" && (
            <div className="payment-input-area">

              <label>Card Number</label>

              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                value={cardNumber}
                onChange={(e) => {
                  setCardNumber(e.target.value);

                  setErrors({
                    ...errors,
                    cardNumber: ""
                  });
                }}
              />

              {errors.cardNumber && (
                <p className="input-error">
                  {errors.cardNumber}
                </p>
              )}

              <div className="card-row">

                <div>
                  <label>Expiry</label>

                  <input
                    type="text"
                    placeholder="MM / YY"
                    value={expiry}
                    onChange={(e) => {
                      setExpiry(e.target.value);

                      setErrors({
                        ...errors,
                        expiry: ""
                      });
                    }}
                  />

                  {errors.expiry && (
                    <p className="input-error">
                      {errors.expiry}
                    </p>
                  )}
                </div>

                <div>
                  <label>CVV</label>

                  <input
                    type="password"
                    placeholder="•••"
                    value={cvv}
                    onChange={(e) => {
                      setCvv(e.target.value);

                      setErrors({
                        ...errors,
                        cvv: ""
                      });
                    }}
                  />

                  {errors.cvv && (
                    <p className="input-error">
                      {errors.cvv}
                    </p>
                  )}
                </div>

              </div>

            </div>
          )}

          {method === "netbanking" && (
            <div className="payment-input-area">

              <label>Select your bank</label>

              <select defaultValue="Select bank">
                <option>Select bank</option>
                <option>State Bank of India</option>
                <option>HDFC Bank</option>
                <option>ICICI Bank</option>
                <option>Axis Bank</option>
                <option>Bank of Baroda</option>
              </select>

              {errors.bank && (
                <p className="input-error">
                  {errors.bank}
                </p>
              )}

            </div>
          )}

        </section>

        <aside className="order-summary rounded-xl">

          <p className="section-label">
            BOOKING SUMMARY
          </p>

          <h2>{movieTitle}</h2>

          <div className="summary-details">

            <div>
              <span>Theatre</span>
              <strong>{theatre}</strong>
            </div>

            <div>
              <span>Screen</span>
              <strong>{screen}</strong>
            </div>

            <div>
              <span>Showtime</span>
              <strong>
              {new Date(`${showDate}T00:00:00`).toLocaleDateString(
                "en-IN",
                {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                }
              )}{" "}
              · {showtime}
            </strong>
            </div>

            <div>
              <span>Seats</span>
              <strong>
                {seats.join(", ")}
              </strong>
            </div>

          </div>

          <div className="price-breakdown">

            <div>
              <span>Tickets</span>
              <strong>
                ₹{ticketPrice}
              </strong>
            </div>

            <div>
              <span>Convenience fee</span>
              <strong>
                ₹{convenienceFee}
              </strong>
            </div>

            <div className="total-line">
              <span>Total</span>
              <strong>
                ₹{total}
              </strong>
            </div>

          </div>

          <button
            className="pay-button rounded-xl"
            onClick={handlePayment}
            disabled={processing}
          >
            {processing
              ? "Processing..."
              : `Pay ₹${total} →`}
          </button>

          <p className="secure-text">
            🔒 Secure payment · Your payment
            details are protected.
          </p>

        </aside>

      </main>

      <footer className="payment-footer">
        <strong>I-Cinema</strong>
        <span>
          Discover · Decide · Book
        </span>
      </footer>

    </div>
  );
}
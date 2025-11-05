import React from 'react'
import 'bootstrap-icons/font/bootstrap-icons.css'
import { Nav, Navbar, Container } from 'react-bootstrap'

function NavigationBar() {
    return (
        <Navbar bg="dark" variant="dark" fixed="bottom">
            <Container className="justify-content-around text-center">
                <Nav className="w-100 justify-content-around">
                    <Nav.Link href="/" className="d-flex flex-column align-items-center text-white">
                        <i className="bi bi-house-door-fill fs-4"></i>
                        <span className="small">Home</span>
                    </Nav.Link>

                    <Nav.Link href="/shop" className="d-flex flex-column align-items-center text-white">
                        <i className="bi bi-bag-heart-fill fs-4"></i>
                        <span className="small">Shop</span>
                    </Nav.Link>

                    <Nav.Link href="/closet" className="d-flex flex-column align-items-center text-white">
                        <i className="bi bi-person-standing-dress fs-4"></i>
                        <span className="small">Closet</span>
                    </Nav.Link>
                    
                    <Nav.Link href="/account" className="d-flex flex-column align-items-center text-white">
                        <i className="bi bi-person-circle fs-4"></i>
                        <span className="small">Account</span>
                    </Nav.Link>
                </Nav>
            </Container>
        </Navbar>
    )
}

export default NavigationBar

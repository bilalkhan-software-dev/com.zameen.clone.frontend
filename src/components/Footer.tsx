"use client";

import {
  Box,
  Typography,
  Container,
  Link as MuiLink,
  Stack,
} from "@mui/material";
import Link from "next/link";

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: "auto",
        backgroundColor: "primary.dark",
        color: "white",
      }}
    >
      <Container maxWidth="lg">
        <Stack
          direction={{ xs: "column", sm: "row" }}
          // justifyContent="space-between"
          // alignItems="center"
          spacing={2}
          sx={{justifyContent:"space-between",alignItems:"center"}}
        >
          <Typography variant="body2">
            © {new Date().getFullYear()} PropertyHub. All rights reserved.
          </Typography>
          <Stack direction="row" spacing={2}>
            <MuiLink
              component={Link}
              href="/about"
              color="inherit"
              underline="hover"
            >
              About
            </MuiLink>
            <MuiLink
              component={Link}
              href="/contact"
              color="inherit"
              underline="hover"
            >
              Contact
            </MuiLink>
            <MuiLink
              component={Link}
              href="/privacy"
              color="inherit"
              underline="hover"
            >
              Privacy
            </MuiLink>
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Footer;

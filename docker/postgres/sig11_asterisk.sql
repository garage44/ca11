--
-- PostgreSQL database dump
--

-- Dumped from database version 12.1 (Debian 12.1-1.pgdg100+1)
-- Dumped by pg_dump version 12.1

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: sig11_asterisk; Type: TABLE; Schema: public; Owner: asterisk
--

CREATE TABLE public.sig11_asterisk (
    id character varying(100),
    pubkey character varying(100)
);


ALTER TABLE public.sig11_asterisk OWNER TO asterisk;

--
-- Data for Name: sig11_asterisk; Type: TABLE DATA; Schema: public; Owner: asterisk
--

COPY public.sig11_asterisk (id, pubkey) FROM stdin;
\.


--
-- PostgreSQL database dump complete
--


import { useEffect, useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"

import {
  Plane,
  ArrowLeft,
  FileText,
  ShieldCheck,
  Lock,
  Printer,
} from "lucide-react"

import "./legal.css"

/* =========================================================
   CONTENU
   ========================================================= */

const SECTIONS = [
  {
    id: "mentions",
    label: "Mentions légales",
    icon: FileText,
    title: "Mentions légales",
    lead:
      "Informations relatives à l'éditeur de la plateforme KonnectiFly et aux conditions d'accès au site.",
    blocks: [
      {
        title: "Éditeur de la plateforme",
        paragraphs: [
          "KonnectiFly est une plateforme de revente de forfaits eSIM destinée aux agences de voyage, tour-opérateurs et revendeurs professionnels.",
          "Siège : Alger, Algérie.",
          "Contact : support@konnectifly.com",
        ],
      },
      {
        title: "Directeur de la publication",
        paragraphs: [
          "La direction de KonnectiFly est responsable de la publication et de la modération des contenus diffusés sur la plateforme.",
        ],
      },
      {
        title: "Hébergement",
        paragraphs: [
          "L'application et l'API sont hébergées sur des infrastructures cloud sécurisées, avec réplication des données et chiffrement des communications en transit.",
        ],
      },
      {
        title: "Propriété intellectuelle",
        paragraphs: [
          "La marque KonnectiFly, le logo, l'interface, les textes, les visuels et l'ensemble des éléments composant la plateforme sont protégés par le droit de la propriété intellectuelle.",
          "Toute reproduction, représentation, adaptation ou exploitation, totale ou partielle, sans autorisation écrite préalable est interdite.",
        ],
      },
      {
        title: "Responsabilité",
        paragraphs: [
          "Les informations publiées sur la plateforme sont fournies à titre indicatif et peuvent évoluer. La disponibilité des réseaux mobiles dépend des opérateurs partenaires et des conditions locales du pays de destination.",
          "KonnectiFly ne peut être tenue responsable des interruptions imputables aux opérateurs, aux autorités locales ou à un usage non conforme du service.",
        ],
      },
      {
        title: "Droit applicable",
        paragraphs: [
          "Le présent site et les prestations associées sont soumis au droit algérien. Tout litige relève, à défaut d'accord amiable, des tribunaux compétents d'Alger.",
        ],
      },
    ],
  },
  {
    id: "cgu",
    label: "Conditions d'utilisation",
    icon: ShieldCheck,
    title: "Conditions générales d'utilisation",
    lead:
      "Ces conditions encadrent l'accès à l'espace agence, les commandes de forfaits eSIM et les obligations de chaque partie.",
    blocks: [
      {
        title: "1. Objet",
        paragraphs: [
          "Les présentes conditions générales d'utilisation définissent les modalités d'accès et d'utilisation de la plateforme KonnectiFly par les agences partenaires.",
          "L'utilisation de la plateforme vaut acceptation pleine et entière des présentes conditions.",
        ],
      },
      {
        title: "2. Compte agence",
        paragraphs: [
          "L'ouverture d'un compte est réservée aux professionnels. L'agence s'engage à fournir des informations exactes et à les tenir à jour.",
          "Les identifiants et clés d'API sont strictement personnels. Toute commande passée depuis un compte est réputée effectuée par l'agence titulaire.",
          "Les nouvelles inscriptions sont soumises à validation par l'équipe KonnectiFly avant activation.",
        ],
      },
      {
        title: "3. Commandes et prix",
        paragraphs: [
          "Les prix sont affichés en dinars algériens (DZD) et peuvent être modifiés à tout moment avant la validation d'une commande.",
          "La commande devient ferme après confirmation. Le montant correspondant est débité du solde de crédits de l'agence.",
        ],
      },
      {
        title: "4. Livraison et activation",
        paragraphs: [
          "Le forfait eSIM est délivré sous forme d'un code d'activation ou d'un QR code, disponible dans l'espace « Commandes » et envoyé à l'adresse email renseignée.",
          "L'agence est responsable de la transmission des informations d'activation à son client final.",
          "La durée de validité du forfait commence à la première connexion au réseau de destination, sauf mention contraire du forfait.",
        ],
      },
      {
        title: "5. Utilisation acceptable",
        paragraphs: [
          "L'agence s'engage à ne pas utiliser la plateforme à des fins illicites, frauduleuses ou contraires aux conditions des opérateurs.",
          "Toute tentative de contournement des restrictions techniques, de revente non autorisée ou d'usage abusif peut entraîner la suspension du compte.",
        ],
      },
      {
        title: "6. Réclamations et remboursements",
        paragraphs: [
          "Une eSIM non activée et non utilisée peut faire l'objet d'une demande de remboursement dans les 7 jours suivant l'achat.",
          "Les forfaits déjà activés ou consommés ne sont pas remboursables. Toute anomalie doit être signalée dans les 72 heures à support@konnectifly.com, avec la référence de commande.",
        ],
      },
      {
        title: "7. Suspension et résiliation",
        paragraphs: [
          "KonnectiFly peut suspendre ou résilier un compte en cas de manquement aux présentes conditions, d'impayé, de fraude ou de risque pour la sécurité de la plateforme.",
          "L'agence peut fermer son compte à tout moment, sous réserve du règlement des sommes dues.",
        ],
      },
      {
        title: "8. Évolution des conditions",
        paragraphs: [
          "Les présentes conditions peuvent être mises à jour. Les modifications substantielles sont notifiées par email ou dans l'espace agence avant leur entrée en vigueur.",
        ],
      },
      {
        title: "9. Droit applicable",
        paragraphs: [
          "Les présentes conditions sont régies par le droit algérien. Les parties s'efforcent de résoudre tout différend à l'amiable avant toute action judiciaire.",
        ],
      },
    ],
  },
  {
    id: "confidentialite",
    label: "Confidentialité",
    icon: Lock,
    title: "Politique de confidentialité",
    lead:
      "Cette politique décrit les données personnelles traitées par KonnectiFly, leur finalité, leur durée de conservation et vos droits.",
    blocks: [
      {
        title: "1. Données collectées",
        paragraphs: [
          "Dans le cadre de la relation commerciale, nous collectons les données d'identification et de contact (nom, société, email, téléphone, adresse), les informations de facturation et l'historique des commandes.",
          "Des données techniques sont également enregistrées : adresse IP, journaux de connexion, type d'appareil et actions réalisées sur la plateforme.",
        ],
      },
      {
        title: "2. Finalités du traitement",
        paragraphs: [
          "Les données sont utilisées pour créer et gérer le compte agence, exécuter les commandes, assurer la facturation, fournir le support, sécuriser la plateforme et respecter nos obligations légales.",
          "Avec votre accord, elles peuvent aussi servir à vous informer des nouveautés et offres KonnectiFly. Vous pouvez retirer cet accord à tout moment.",
        ],
      },
      {
        title: "3. Base légale",
        paragraphs: [
          "Les traitements nécessaires à la fourniture du service reposent sur l'exécution du contrat. La sécurité et la prévention de la fraude reposent sur notre intérêt légitime. Les communications commerciales reposent sur votre consentement.",
        ],
      },
      {
        title: "4. Durée de conservation",
        paragraphs: [
          "Les données sont conservées pendant la durée de la relation contractuelle, puis pendant les délais légaux applicables, notamment en matière comptable et fiscale.",
          "Les journaux techniques sont conservés pour une durée limitée, proportionnée aux besoins de sécurité.",
        ],
      },
      {
        title: "5. Destinataires",
        paragraphs: [
          "Les données sont accessibles aux équipes habilitées de KonnectiFly et, lorsque cela est nécessaire, aux opérateurs eSIM partenaires, aux prestataires de paiement, d'hébergement et de messagerie.",
          "Elles peuvent être communiquées aux autorités compétentes sur réquisition légale.",
        ],
      },
      {
        title: "6. Transferts hors d'Algérie",
        paragraphs: [
          "Certains partenaires techniques peuvent être situés en dehors de l'Algérie. Dans ce cas, nous veillons à ce que des garanties appropriées encadrent le transfert des données.",
        ],
      },
      {
        title: "7. Sécurité",
        paragraphs: [
          "Nous mettons en œuvre des mesures techniques et organisationnelles adaptées : chiffrement des communications, contrôle des accès, rotation des clés d'API et journalisation des opérations sensibles.",
        ],
      },
      {
        title: "8. Vos droits",
        paragraphs: [
          "Vous disposez d'un droit d'accès, de rectification, d'effacement, de limitation, d'opposition et de portabilité de vos données.",
          "Pour exercer ces droits, écrivez à support@konnectifly.com depuis l'adresse email associée à votre compte. Une réponse vous sera apportée dans les meilleurs délais.",
        ],
      },
      {
        title: "9. Cookies",
        paragraphs: [
          "La plateforme utilise uniquement des cookies et un stockage local nécessaires à l'authentification, à la sécurité et au bon fonctionnement de l'espace agence.",
          "Aucun cookie publicitaire tiers n'est déposé sans votre accord. Vous pouvez supprimer les cookies depuis les réglages de votre navigateur.",
        ],
      },
      {
        title: "10. Contact",
        paragraphs: [
          "Pour toute question relative à cette politique, contactez support@konnectifly.com ou écrivez à KonnectiFly — Protection des données, Alger, Algérie.",
        ],
      },
    ],
  },
]

const DEFAULT_SECTION = "mentions"

/* =========================================================
   PAGE
   ========================================================= */

export default function Legal() {
  const location = useLocation()
  const navigate = useNavigate()

  const [active, setActive] = useState(() => {
    const hash = location.hash.replace("#", "")
    return SECTIONS.some((section) => section.id === hash) ? hash : DEFAULT_SECTION
  })

  /* Synchronise l'onglet avec le fragment d'URL (#cgu, #confidentialite…) */

  useEffect(() => {
    const hash = location.hash.replace("#", "")

    if (SECTIONS.some((section) => section.id === hash)) {
      setActive(hash)
    }
  }, [location.hash])

  const section = SECTIONS.find((item) => item.id === active) || SECTIONS[0]

  const selectSection = (id) => {
    setActive(id)

    navigate(`/legal#${id}`, { replace: true })

    window.scrollTo({ top: 0 })
  }

  return (
    <div className="kf-legal">
      {/* ---------- EN-TÊTE ---------- */}

      <header className="kf-legal-header">
        <div className="kf-legal-header-inner">
          <Link to="/" className="kf-legal-logo">
            <span className="kf-legal-logo-icon">
              <Plane size={20} />
            </span>
            <span className="kf-legal-logo-text">
              Konnecti<span className="kf-legal-logo-accent">Fly</span>
            </span>
          </Link>

          <div className="kf-legal-header-actions">
            <Link to="/" className="kf-legal-back">
              <ArrowLeft size={16} />
              Retour au site
            </Link>

            <Link to="/login" className="kf-legal-login">
              Espace agence
            </Link>
          </div>
        </div>
      </header>

      {/* ---------- NAVIGATION ---------- */}

      <div className="kf-legal-tabs-wrapper">
        <nav className="kf-legal-tabs" aria-label="Informations légales">
          {SECTIONS.map((item) => {
            const Icon = item.icon

            return (
              <button
                key={item.id}
                type="button"
                className="kf-legal-tab"
                aria-current={active === item.id ? "page" : undefined}
                onClick={() => selectSection(item.id)}
              >
                <Icon size={15} />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* ---------- CONTENU ---------- */}

      <main className="kf-legal-main">
        <article className="kf-legal-card">
          <p className="kf-legal-eyebrow">KonnectiFly · Informations légales</p>

          <h1 className="kf-legal-title">{section.title}</h1>

          <p className="kf-legal-lead">{section.lead}</p>

          <p className="kf-legal-updated">
            Dernière mise à jour : 31 octobre 2026
          </p>

          <div className="kf-legal-body">
            {section.blocks.map((block) => (
              <section key={block.title} className="kf-legal-block">
                <h2>{block.title}</h2>

                {block.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </section>
            ))}
          </div>

          <div className="kf-legal-footer">
            <button
              type="button"
              className="kf-legal-print"
              onClick={() => window.print()}
            >
              <Printer size={15} />
              Imprimer cette page
            </button>

            <a href="mailto:support@konnectifly.com" className="kf-legal-contact">
              Une question ? support@konnectifly.com
            </a>
          </div>
        </article>
      </main>
    </div>
  )
}

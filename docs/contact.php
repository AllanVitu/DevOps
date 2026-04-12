<?php
// Script de traitement de formulaire O2Switch - Portfolio Allan Vitu
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Nettoyage des données
    $name = isset($_POST['name']) && !empty(trim($_POST['name'])) ? strip_tags(trim($_POST['name'])) : 'Anonyme (Facultatif)';
    $email = isset($_POST['email']) ? filter_var(trim($_POST['email']), FILTER_SANITIZE_EMAIL) : '';
    $message = isset($_POST['message']) ? trim($_POST['message']) : '';

    if (empty($email) || empty($message)) {
        http_response_code(400);
        echo json_encode(["message" => "L'email et le message sont requis."]);
        exit;
    }

    // Filtrage Anti-Spam
    $blacklist = ['bite', 'salopes', 'caca', 'tamere', 'tamerelapute', 'tupue', 'salepute'];
    $isSpam = false;
    $msgLower = strtolower($message);
    
    foreach($blacklist as $word) {
        if (strpos($msgLower, $word) !== false) {
            $isSpam = true;
            break;
        }
    }

    // Destinataire principal de la boîte de réception
    $to = "allan.vitu90@gmail.com";
    
    // Si c'est du spam, on ajoute un marqueur au sujet pour le rediriger vers le dossier Spam via les règles de la boite mail
    $subject = $isSpam ? "[SPAM - TROLL] Contact depuis le Portfolio" : "Nouveau message de $name - Portfolio DevOps";
    
    // Entêtes de l'email
    $headers = "From: no-reply@" . $_SERVER['SERVER_NAME'] . "\r\n";
    $headers .= "Reply-To: $email\r\n";
    $headers .= "MIME-Version: 1.0\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    if ($isSpam) {
        $headers .= "X-Spam-Flag: YES\r\n"; // Marqueur technique pour les filtres anti-spam
    }

    // Corps du message
    $email_content = "Nouveau message depuis le portfolio :\n\n";
    $email_content .= "Nom / Prénom : $name\n";
    $email_content .= "Email de contact : $email\n";
    $email_content .= "----------------------------------------\n";
    $email_content .= "Message :\n$message\n";
    $email_content .= "----------------------------------------\n";
    if($isSpam) {
        $email_content .= "⚠️ AVERTISSEMENT : Ce message contient des mots blacklistés et a été filtré.\n";
    }

    // Envoi via la fonction mail() d'O2Switch
    if (mail($to, $subject, $email_content, $headers)) {
        http_response_code(200);
        echo json_encode(["message" => "Message envoyé avec succès."]);
    } else {
        http_response_code(500);
        echo json_encode(["message" => "Échec de l'envoi via le serveur."]);
    }
} else {
    http_response_code(403);
    echo json_encode(["message" => "Méthode non autorisée."]);
}
?>

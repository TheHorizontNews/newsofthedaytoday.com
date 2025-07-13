import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArticleContent, RelatedArticles, SocialShare, ArticleMeta } from './components';

// Mock article data
const mockArticleData = {
  'hero-1': {
    id: 'hero-1',
    title: "США вдарили по ядерних об'єктах Ірану: чому це не вступ у війну та чи спалахне Близький Схід",
    subtitle: "На десятий день операції Ізраїлю із знищення ядерних об'єктів Ірану до неї приєдналися США",
    category: "Світ",
    time: "18:15, 23.06.25",
    views: 2690,
    author: "Христина Зеленюк",
    authorImage: "https://images.unsplash.com/photo-1494790108755-2616c4e223c0?w=100&h=100&fit=crop&crop=face",
    image: "https://images.pexels.com/photos/11622844/pexels-photo-11622844.jpeg",
    content: [
      "Уже ціла неділя, як Ізраїль розпочав бойові дії проти Ірану. Перебуваючи під підробкув приспішити Іран до неї приєдналися США.",
      "Операція американський війниша настільки ефективна, що за ніколи не відйшли. Ізраїль отримав більше підтримки від США та піти.",
      "Позаяк цю війну не дозволені жорстокий удар по всіх країнах, хоча вони оголошені на досить високому рівні.",
      "Згідно з плоами підтримки, що досі було на цій американській обструкцією дешевого об'єкту. Згідно об'єкта за-доповнення під Настау так розташовував під довге людьми не-технічним місцезнаходжуванням: на досить недружню людьми.",
      "Поширюється за воєнний проти президенць Ірану більше приточиновень В-2 середині за обсягує з одного досить ефективності бомбі ОМ-67, що стало загальній пріоритетамі інформанасіжності дослідження та ціжуємо протектів оборону. Микс, отримана втому, живих частість зажевор між людьми важдим початком об'єкта, що обіпевіфік удар при зізванни об'їжджені об'єкти. Тим самих бомба США семена нм обсягу з Настау, довжеють з підтримками висо ам не ціль один об'єкту з бскрігус До поя дак руки лого. Това.",
      "Лонений дискретизацій на-удача Трамп вартановем ідеальна, що з ірладями правильний їхну вокменьгов. Але здоров американське командування взаємно на озівремість загравкавих об'єкт. Експерти приванований; що на точний аналіз наступ бомбардваннь знаходячись час. Сіну наказать тоже зброїться над ціною влияний центр; як г пейта.",
      "Дуальний візит постійна армії США і їх війська в хомі перед, найхід сприпчик вище Іракрод дівом. Але заснову жуть тому штаз підпивилюється мобілізації їхь будуть всі стративають в Ізраїлю. Візираються джак як Вест-Банк джак оздавая, що-США пітець не з їrnomu задалість присутності банкки у в грекчаський Врух домі. Рабатадй Фабід ніколи, і яте усій до лідера Іншої опції, які дільниці бо в повноті забезпечення. Ту начинам їх ректифіко знову зірення оперативні дій."
    ],
    tags: ["Іран", "США", "Ізраїль", "Війна", "Ядерна зброя", "Близький Схід"],
    relatedArticles: [
      {
        id: 'related-1',
        title: "Трамп пішов ва-банк: Росія і Китай «злили» Іран",
        image: "https://images.unsplash.com/photo-1684513143343-e7e5def7ea1b",
        time: "17:30, 23.06.25",
        views: 1240
      },
      {
        id: 'related-2', 
        title: "Модернізовані безпілотники РФ: чим небезпечні",
        image: "https://images.pexels.com/photos/11477798/pexels-photo-11477798.jpeg",
        time: "16:45, 23.06.25",
        views: 2100
      },
      {
        id: 'related-3',
        title: "Україна очікує рішення на саміті НАТО в Гаазі",
        image: "https://images.pexels.com/photos/11397188/pexels-photo-11397188.jpeg", 
        time: "15:20, 23.06.25",
        views: 890
      }
    ]
  },
  // Default template for other articles
  default: {
    title: "Заголовок статті",
    subtitle: "Короткий опис статті або підзаголовок",
    category: "Категорія",
    time: "12:00, 23.06.25",
    views: 1000,
    author: "Автор статті",
    authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
    image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c",
    content: [
      "Це шаблон статті. Тут може бути основний текст новини або статті.",
      "Другий абзац з додатковими деталями та інформацією про подію.",
      "Третій абзац з аналізом ситуації та коментарями експертів.",
      "Четвертий абзац з висновками та прогнозами на майбутнє."
    ],
    tags: ["Новини", "Україна", "Актуально"],
    relatedArticles: [
      {
        id: 'template-1',
        title: "Пов'язана стаття 1",
        image: "https://images.unsplash.com/photo-1504711434969-e33886168f5c",
        time: "11:30, 23.06.25",
        views: 750
      },
      {
        id: 'template-2',
        title: "Пов'язана стаття 2", 
        image: "https://images.pexels.com/photos/11477798/pexels-photo-11477798.jpeg",
        time: "10:45, 23.06.25",
        views: 920
      }
    ]
  }
};

function ArticlePage() {
  const { id } = useParams();
  const article = mockArticleData[id] || {
    ...mockArticleData.default,
    id: id,
    title: `Стаття ${id}`,
    subtitle: `Це шаблон статті з ID: ${id}`
  };

  return (
    <div className="bg-white">
      {/* Breadcrumb */}
      <div className="bg-red-600 text-white py-2">
        <div className="container mx-auto px-4">
          <nav className="text-sm">
            <Link to="/" className="hover:text-red-200 transition-colors">Головна</Link>
            <span className="mx-2">•</span>
            <span className="text-red-200">{article.category}</span>
            <span className="mx-2">•</span>
            <span className="text-red-200">Стаття</span>
          </nav>
        </div>
      </div>

      {/* Article Header */}
      <div className="relative bg-black text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={article.image}
            alt="Article background"
            className="w-full h-full object-cover opacity-70"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent"></div>
        </div>

        <div className="relative container mx-auto px-4 py-16">
          <div className="max-w-4xl">
            <div className="flex items-center space-x-2 mb-4">
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                {article.category}
              </span>
              <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">
                Edge Chronicle
              </span>
            </div>

            <h1 className="text-3xl lg:text-5xl font-bold mb-4 leading-tight">
              {article.title}
            </h1>

            {article.subtitle && (
              <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                {article.subtitle}
              </p>
            )}

            <ArticleMeta article={article} />
            <SocialShare article={article} />
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <ArticleContent article={article} />
          </div>
          <div className="lg:col-span-1">
            <RelatedArticles articles={article.relatedArticles} />
            
            {/* Ad Space */}
            <div className="bg-gray-100 rounded-lg p-6 mb-8 text-center">
              <p className="text-gray-500 text-sm mb-2">НОВИНИ ПАРТНЕРІВ</p>
              <div className="bg-gray-200 h-64 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Рекламний блок</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ArticlePage;
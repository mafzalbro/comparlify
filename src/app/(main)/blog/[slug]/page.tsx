import Image from 'next/image';
import { notFound } from 'next/navigation';
import { blogPosts, BlogPost } from '@/app/blog/posts';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export async function generateStaticParams() {
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

function getPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  return (
    <article className="container max-w-3xl py-16 md:py-24">
      <div className="text-center mb-8">
        <p className="text-muted-foreground text-sm mb-2">{post.date}</p>
        <h1 className="font-headline text-4xl md:text-5xl font-bold text-foreground">
          {post.title}
        </h1>
      </div>

      <div className="relative w-full h-96 mb-8 rounded-lg overflow-hidden shadow-lg">
        <Image
          src={post.image.replace('400/250', '800/400')}
          alt={post.title}
          data-ai-hint={post.dataAiHint}
          fill
          className="object-cover"
          priority
        />
      </div>
      
      <div className="flex items-center gap-4 mb-8">
        <Avatar>
            <AvatarImage src={`https://picsum.photos/100/100?random=${post.slug}`} alt={post.author} data-ai-hint="person photo" />
            <AvatarFallback>{post.author.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
            <p className="font-semibold text-foreground">{post.author}</p>
            <p className="text-sm text-muted-foreground">{post.readTime} min read</p>
        </div>
      </div>

      <div className="prose prose-lg dark:prose-invert mx-auto text-foreground">
        <p>{post.description}</p>
        <p>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus. Suspendisse lectus tortor, dignissim sit amet, adipiscing nec, ultricies sed, dolor. Cras elementum ultrices diam. Maecenas ligula massa, varius a, semper congue, euismod non, mi. Proin porttitor, orci nec nonummy molestie, enim est eleifend mi, non fermentum diam nisl sit amet erat. Duis semper. Duis arcu massa, scelerisque vitae, consequat in, pretium a, enim. Pellentesque congue.
        </p>
        <p>
            The journey of creating and selling an online course is filled with decisions. One of the most critical is choosing the right platform to host your content. It's the foundation of your online school, affecting everything from student experience to your bottom line. With so many options available, how do you make the right choice?
        </p>
        <blockquote>
            "The best platform is the one that removes friction and lets you focus on what you do best: creating."
        </blockquote>
        <h2>Key Considerations</h2>
        <p>
            Here are some key areas to focus on during your evaluation. We'll dive deeper into each of these in our full comparison guide.
        </p>
        <ul>
            <li><strong>Pricing Model:</strong> Do they charge a monthly fee, a transaction fee, or a combination? Understand the total cost of ownership as your student base grows.</li>
            <li><strong>Feature Set:</strong> Does the platform support quizzes, certificates, drip content, and community features? Match the features to your teaching style.</li>
            <li><strong>Customization:</strong> How much control do you have over the look and feel of your course pages and sales site?</li>
            <li><strong>Integrations:</strong> Can the platform connect with your favorite email marketing, analytics, and other business tools?</li>
        </ul>
        <p>
            Making a thoughtful decision now will save you countless hours and potential headaches down the road. Use our detailed comparison table to see how the top platforms stack up against each other on these features and more.
        </p>
      </div>
    </article>
  );
}
